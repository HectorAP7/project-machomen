package com.machomen.boletas.service;

import com.machomen.boletas.client.ProductoFeignClient;
import com.machomen.boletas.dto.BoletaRequest;
import com.machomen.boletas.dto.BoletaResponse;
import com.machomen.boletas.dto.DetalleRequest;
import com.machomen.boletas.messaging.BoletaProducer;
import com.machomen.boletas.model.Boleta;
import com.machomen.boletas.model.Producto;
import com.machomen.boletas.model.Usuario;
import com.machomen.boletas.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios de BoletaService.
 * Cubre: registro exitoso, descuento real de stock, validación de stock
 * insuficiente y cambio de estado de boletas.
 */
@ExtendWith(MockitoExtension.class)
class BoletaServiceTest {

    @Mock private IBoletaRepository        boletaRepo;
    @Mock private IBoletaDetalleRepository detalleRepo;
    @Mock private IProductoRepository      productoRepo;
    @Mock private IUsuarioRepository       usuarioRepo;
    @Mock private IDistritoRepository      distritoRepo;
    @Mock private ProductoFeignClient      productoClient;
    @Mock private BoletaProducer           producer;

    @InjectMocks private BoletaService boletaService;

    private Usuario usuario;

    @BeforeEach
    void simularUsuarioAutenticado() {
        usuario = new Usuario();
        usuario.setIdusuario(1);
        usuario.setNombres("Christian");
        usuario.setApellidos("Huarcaya");
        usuario.setCorreo("christian@machomen.com");
        // Simula el SecurityContext que usa registrarBoleta()
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("christian@machomen.com", null, List.of()));
    }

    @AfterEach
    void limpiarContexto() {
        SecurityContextHolder.clearContext();
    }

    private BoletaRequest requestConItem(int idProducto, int cantidad) {
        DetalleRequest item = new DetalleRequest();
        item.setIdProducto(idProducto);
        item.setCantidad(cantidad);
        item.setPrecio(new BigDecimal("150.00"));
        item.setTalla("M");

        BoletaRequest req = new BoletaRequest();
        req.setIdDistrito(1);
        req.setDireccion("Av. Test 123");
        req.setTipoPago(3);
        req.setNroOperacion("OP-001");
        req.setSubtotal(new BigDecimal("150.00"));
        req.setEnvio(BigDecimal.ZERO);
        req.setTotal(new BigDecimal("150.00"));
        req.setItems(List.of(item));
        return req;
    }

    private Producto producto(int id, int stock) {
        Producto p = new Producto();
        p.setIdproducto(id);
        p.setStock(stock);
        return p;
    }

    @Test
    @DisplayName("registrarBoleta() descuenta el stock real del producto comprado")
    void registrar_descuentaStock() {
        when(usuarioRepo.findByCorreo("christian@machomen.com")).thenReturn(Optional.of(usuario));
        when(distritoRepo.findById(1)).thenReturn(Optional.empty());
        when(productoClient.obtenerProducto(5)).thenReturn(producto(5, 10));

        Boleta guardada = new Boleta();
        guardada.setIdboleta(99);
        when(boletaRepo.save(any(Boleta.class))).thenReturn(guardada);
        when(productoRepo.findById(5)).thenReturn(Optional.of(producto(5, 10)));

        BoletaResponse res = boletaService.registrarBoleta(requestConItem(5, 3));

        // Captura el producto guardado y verifica que el stock bajó de 10 a 7
        ArgumentCaptor<Producto> captor = ArgumentCaptor.forClass(Producto.class);
        verify(productoRepo).save(captor.capture());
        assertThat(captor.getValue().getStock()).isEqualTo(7);
        assertThat(res.getIdBoleta()).isEqualTo(99);
    }

    @Test
    @DisplayName("registrarBoleta() lanza error si el stock es insuficiente")
    void registrar_stockInsuficiente_lanzaError() {
        when(usuarioRepo.findByCorreo("christian@machomen.com")).thenReturn(Optional.of(usuario));
        when(distritoRepo.findById(1)).thenReturn(Optional.empty());
        // Solo hay 2 en stock pero se piden 3
        when(productoClient.obtenerProducto(5)).thenReturn(producto(5, 2));

        assertThatThrownBy(() -> boletaService.registrarBoleta(requestConItem(5, 3)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Stock insuficiente");

        // No debe guardar nada si el stock no alcanza
        verify(boletaRepo, never()).save(any());
    }

    @Test
    @DisplayName("registrarBoleta() falla si el usuario autenticado no existe")
    void registrar_usuarioNoEncontrado() {
        when(usuarioRepo.findByCorreo("christian@machomen.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> boletaService.registrarBoleta(requestConItem(5, 1)))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Usuario no encontrado");
    }

    @Test
    @DisplayName("cambiarEstado() actualiza el estado de la boleta y devuelve success")
    void cambiarEstado_actualizaCorrectamente() {
        Boleta b = new Boleta();
        b.setIdboleta(50);
        b.setEstado(1);
        when(boletaRepo.findById(50)).thenReturn(Optional.of(b));
        when(boletaRepo.save(any(Boleta.class))).thenReturn(b);

        var res = boletaService.cambiarEstado(50, 2);

        assertThat(b.getEstado()).isEqualTo(2);
        assertThat(res.get("success")).isEqualTo(true);
        assertThat(res.get("estado")).isEqualTo(2);
    }

    @Test
    @DisplayName("cambiarEstado() lanza error si la boleta no existe")
    void cambiarEstado_boletaInexistente() {
        when(boletaRepo.findById(anyInt())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> boletaService.cambiarEstado(999, 2))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Boleta no encontrada");
    }
}
