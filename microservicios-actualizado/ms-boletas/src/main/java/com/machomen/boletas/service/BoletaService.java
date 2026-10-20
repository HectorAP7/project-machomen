package com.machomen.boletas.service;

import com.machomen.boletas.client.ProductoFeignClient;
import com.machomen.boletas.dto.*;
import com.machomen.boletas.messaging.BoletaEventoDTO;
import com.machomen.boletas.messaging.BoletaProducer;
import com.machomen.boletas.model.*;
import com.machomen.boletas.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class BoletaService {

    private static final Logger log = LoggerFactory.getLogger(BoletaService.class);

    @Autowired private IBoletaRepository        boletaRepo;
    @Autowired private IBoletaDetalleRepository detalleRepo;
    @Autowired private IProductoRepository      productoRepo;
    @Autowired private IUsuarioRepository       usuarioRepo;
    @Autowired private IDistritoRepository      distritoRepo;
    @Autowired private ProductoFeignClient      productoClient;
    @Autowired private BoletaProducer           producer;

    // ── Registrar boleta ─────────────────────────────────────────────────────

    @Transactional(rollbackFor = Exception.class)
    public BoletaResponse registrarBoleta(BoletaRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepo.findByCorreo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));

        Distrito distrito = distritoRepo.findById(req.getIdDistrito()).orElse(null);

        // Verificar stock via Feign (con fallback ante fallo)
        for (DetalleRequest item : req.getItems()) {
            try {
                Producto p = productoClient.obtenerProducto(item.getIdProducto());
                if (p != null && p.getStock() < item.getCantidad())
                    throw new RuntimeException("Stock insuficiente para producto ID: " + item.getIdProducto()
                            + " (disponible: " + p.getStock() + ")");
            } catch (RuntimeException ex) {
                if (ex.getMessage() != null && ex.getMessage().startsWith("Stock insuficiente")) throw ex;
                log.warn("Feign verificación stock falló (se omite): {}", ex.getMessage());
            }
        }

        // Crear cabecera
        Boleta boleta = new Boleta();
        boleta.setUsuario(usuario);
        boleta.setDistrito(distrito);
        boleta.setDireccionEnvio(req.getDireccion());
        boleta.setFecha(LocalDateTime.now());
        boleta.setTipoPago(req.getTipoPago());
        boleta.setNroOperacion(req.getNroOperacion());
        boleta.setImporte_productos(req.getSubtotal());
        boleta.setImporte_envio(req.getEnvio());
        boleta.setImporte_total(req.getTotal());

        BigDecimal subtotalSinIgv = req.getSubtotal().divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
        boleta.setImporte_neto(subtotalSinIgv);
        boleta.setImporte_igv(req.getSubtotal().subtract(subtotalSinIgv));
        boleta.setEstado(1);

        Boleta guardada = boletaRepo.save(boleta);

        // Guardar detalle + descontar stock
        for (DetalleRequest item : req.getItems()) {
            try {
                Producto prod = productoRepo.findById(item.getIdProducto()).orElse(null);
                if (prod != null) {
                    int nuevoStock = Math.max(0, prod.getStock() - item.getCantidad());
                    prod.setStock(nuevoStock);
                    productoRepo.save(prod);
                    if (nuevoStock == 0) {
                        try { productoClient.cambiarEstado(prod.getIdproducto(), 0); }
                        catch (Exception ex) { log.warn("Feign cambiarEstado falló: {}", ex.getMessage()); }
                    }
                }
            } catch (Exception ex) {
                log.warn("Error descontando stock: {}", ex.getMessage());
            }

            BoletaDetalle det = new BoletaDetalle();
            det.setIdboleta(guardada.getIdboleta());
            det.setIdproducto(item.getIdProducto());
            det.setCantidad(item.getCantidad());
            det.setPreciovta(item.getPrecio());
            det.setImporte(item.getPrecio().multiply(new BigDecimal(item.getCantidad())));
            // Guardar talla seleccionada por el cliente
            det.setTalla(item.getTalla());
            detalleRepo.save(det);
        }

        // Publicar evento RabbitMQ (no bloquea si RabbitMQ no está disponible)
        try {
            producer.publicar(new BoletaEventoDTO(
                    guardada.getIdboleta(), usuario.getIdusuario(),
                    usuario.getNombres() + " " + usuario.getApellidos(),
                    usuario.getCorreo(), req.getTotal(), req.getTipoPago(),
                    req.getNroOperacion(), guardada.getFecha(), req.getItems().size()
            ));
        } catch (Exception ex) {
            log.warn("RabbitMQ no disponible, se omite notificación: {}", ex.getMessage());
        }

        return new BoletaResponse(true, "Boleta registrada exitosamente", guardada.getIdboleta());
    }

    // ── Listar por usuario ────────────────────────────────────────────────────

    public List<Map<String, Object>> listarPorUsuarioFlat(int idUsuario) {
        List<Boleta> boletas = boletaRepo.findByUsuarioIdusuarioOrderByFechaDesc(idUsuario);
        return boletas.stream().map(this::toFlatMap).toList();
    }

    public List<Map<String, Object>> listarTodasFlat() {
        return boletaRepo.findAllByOrderByFechaDesc().stream().map(this::toFlatMap).toList();
    }

    private Map<String, Object> toFlatMap(Boleta b) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idboleta",      b.getIdboleta());
        m.put("fecha",         b.getFecha());
        m.put("tipoPago",      b.getTipoPago());
        m.put("nroOperacion",  b.getNroOperacion());
        m.put("estado",        b.getEstado());
        m.put("importe_total", b.getImporte_total());
        m.put("importe_envio", b.getImporte_envio());
        m.put("direccionEnvio",b.getDireccionEnvio());
        if (b.getUsuario() != null) {
            m.put("nombreCliente", b.getUsuario().getNombres() + " " + b.getUsuario().getApellidos());
            m.put("correoCliente", b.getUsuario().getCorreo());
        } else {
            m.put("nombreCliente", "—");
            m.put("correoCliente", "—");
        }
        m.put("distrito", b.getDistrito() != null ? b.getDistrito().getDescripcion() : "—");
        return m;
    }

    // ── Detalle completo ──────────────────────────────────────────────────────

    public Map<String, Object> obtenerDetalleFlat(int id) {
        Boleta b = boletaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleta no encontrada: " + id));

        List<BoletaDetalle> detalles = detalleRepo.findByIdboleta(id);

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idboleta",         b.getIdboleta());
        m.put("fecha",            b.getFecha());
        m.put("estado",           b.getEstado());
        m.put("tipoPago",         b.getTipoPago());
        m.put("nroOperacion",     b.getNroOperacion());
        m.put("direccionEnvio",   b.getDireccionEnvio());
        m.put("importeProductos", b.getImporte_productos());
        m.put("importeEnvio",     b.getImporte_envio());
        m.put("importeNeto",      b.getImporte_neto());
        m.put("importeIgv",       b.getImporte_igv());
        m.put("importeTotal",     b.getImporte_total());
        m.put("nombreCliente",    b.getUsuario() != null ? b.getUsuario().getNombres() + " " + b.getUsuario().getApellidos() : "—");
        m.put("correoCliente",    b.getUsuario() != null ? b.getUsuario().getCorreo() : "—");
        m.put("distrito",         b.getDistrito() != null ? b.getDistrito().getDescripcion() : "—");

        List<Map<String, Object>> items = new ArrayList<>();
        for (BoletaDetalle det : detalles) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("idproducto", det.getIdproducto());
            item.put("cantidad",   det.getCantidad());
            item.put("preciovta",  det.getPreciovta());
            item.put("importe",    det.getImporte());
            item.put("talla",      det.getTalla());   // ← talla guardada en BD
            if (det.getProducto() != null) {
                item.put("descripcion",    det.getProducto().getDescripcion());
                item.put("imagen",         det.getProducto().getImagen());
                item.put("tallaJson",      det.getProducto().getTallaJson());
                item.put("talla_json",     det.getProducto().getTallaJson());
                item.put("caracteristicas",det.getProducto().getCaracteristicas());
            } else {
                item.put("descripcion",    "Producto #" + det.getIdproducto());
                item.put("imagen",         null);
                item.put("tallaJson",      null);
                item.put("talla_json",     null);
                item.put("caracteristicas",null);
            }
            items.add(item);
        }
        m.put("items", items);
        return m;
    }

    // ── Cambiar estado ────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> cambiarEstado(int id, int estado) {
        Boleta b = boletaRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleta no encontrada: " + id));
        b.setEstado(estado);
        boletaRepo.save(b);
        log.info("Boleta #{} estado -> {}", id, estado);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success",  true);
        res.put("idboleta", id);
        res.put("estado",   estado);
        res.put("mensaje",  "Estado actualizado correctamente");
        return res;
    }
}
