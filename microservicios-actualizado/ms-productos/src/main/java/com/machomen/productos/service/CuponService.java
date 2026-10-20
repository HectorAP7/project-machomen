package com.machomen.productos.service;

import com.machomen.productos.model.Cupon;
import com.machomen.productos.repository.ICuponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CuponService {

    @Autowired private ICuponRepository cuponRepo;

    // ── CRUD admin ──────────────────────────────────────────────
    public List<Cupon> listar() { return cuponRepo.findAll(); }

    public Cupon crear(Cupon c) {
        if (cuponRepo.existsByCodigoIgnoreCase(c.getCodigo()))
            throw new RuntimeException("Ya existe un cupón con el código: " + c.getCodigo());
        if (c.getEstado() == null) c.setEstado(1);
        if (c.getUsos() == null)   c.setUsos(0);
        if (c.getMinimo() == null) c.setMinimo(BigDecimal.ZERO);
        if (c.getUsos_max() == null) c.setUsos_max(0);
        c.setCodigo(c.getCodigo().trim().toUpperCase());
        return cuponRepo.save(c);
    }

    public Cupon actualizar(Integer id, Cupon datos) {
        Cupon c = cuponRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado: " + id));
        c.setTipo(datos.getTipo());
        c.setValor(datos.getValor());
        c.setMinimo(datos.getMinimo());
        c.setUsos_max(datos.getUsos_max());
        c.setEstado(datos.getEstado());
        return cuponRepo.save(c);
    }

    public void cambiarEstado(Integer id, Integer estado) {
        Cupon c = cuponRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado: " + id));
        c.setEstado(estado);
        cuponRepo.save(c);
    }

    // ── Validación para el cliente ──────────────────────────────
    /**
     * Valida un código contra el subtotal del carrito.
     * Devuelve { valido, mensaje, codigo, tipo, valor, descuento }.
     */
    public Map<String, Object> validar(String codigo, BigDecimal subtotal) {
        Map<String, Object> r = new LinkedHashMap<>();
        if (codigo == null || codigo.isBlank()) {
            r.put("valido", false); r.put("mensaje", "Ingresa un código."); return r;
        }
        if (subtotal == null) subtotal = BigDecimal.ZERO;

        Cupon c = cuponRepo.findByCodigoIgnoreCase(codigo.trim()).orElse(null);
        if (c == null)                       { r.put("valido", false); r.put("mensaje", "El cupón no existe."); return r; }
        if (c.getEstado() == null || c.getEstado() != 1) { r.put("valido", false); r.put("mensaje", "Este cupón ya no está activo."); return r; }
        if (c.getUsos_max() != null && c.getUsos_max() > 0
                && c.getUsos() != null && c.getUsos() >= c.getUsos_max()) {
            r.put("valido", false); r.put("mensaje", "Este cupón ya alcanzó su límite de usos."); return r;
        }
        if (c.getMinimo() != null && subtotal.compareTo(c.getMinimo()) < 0) {
            r.put("valido", false);
            r.put("mensaje", "Requiere una compra mínima de S/ " + c.getMinimo());
            return r;
        }

        // Calcular descuento
        BigDecimal descuento;
        if (c.getTipo() == 1) { // porcentaje
            descuento = subtotal.multiply(c.getValor()).divide(new BigDecimal("100"));
        } else {                // monto fijo
            descuento = c.getValor();
        }
        if (descuento.compareTo(subtotal) > 0) descuento = subtotal;

        r.put("valido", true);
        r.put("mensaje", "Cupón aplicado correctamente.");
        r.put("codigo", c.getCodigo());
        r.put("tipo", c.getTipo());
        r.put("valor", c.getValor());
        r.put("descuento", descuento.setScale(2, java.math.RoundingMode.HALF_UP));
        return r;
    }
}
