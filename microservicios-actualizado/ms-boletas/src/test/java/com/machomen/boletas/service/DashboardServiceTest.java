package com.machomen.boletas.service;

import com.machomen.boletas.dto.DashboardDTO;
import com.machomen.boletas.model.Boleta;
import com.machomen.boletas.repository.IBoletaDetalleRepository;
import com.machomen.boletas.repository.IBoletaRepository;
import com.machomen.boletas.repository.IProductoRepository;
import com.machomen.boletas.repository.IUsuarioRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * Tests unitarios de DashboardService.
 * Verifica el resumen de KPIs y el ranking real de productos vendidos.
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private IUsuarioRepository       userRepo;
    @Mock private IProductoRepository      prodRepo;
    @Mock private IBoletaRepository        boletaRepo;
    @Mock private IBoletaDetalleRepository detalleRepo;

    @InjectMocks private DashboardService dashboardService;

    private Boleta boletaConTotal(double total) {
        Boleta b = new Boleta();
        b.setImporte_total(BigDecimal.valueOf(total));
        return b;
    }

    @Test
    @DisplayName("obtenerResumen() suma correctamente usuarios, productos, boletas y ganancias")
    void resumen_calculaContadoresYGanancias() {
        when(userRepo.count()).thenReturn(10L);
        when(prodRepo.count()).thenReturn(25L);
        when(boletaRepo.count()).thenReturn(7L);
        when(boletaRepo.findAll()).thenReturn(List.of(
                boletaConTotal(100.0), boletaConTotal(250.50), boletaConTotal(49.50)
        ));

        DashboardDTO dto = dashboardService.obtenerResumen();

        assertThat(dto.getTotalUsuarios()).isEqualTo(10L);
        assertThat(dto.getTotalProductos()).isEqualTo(25L);
        assertThat(dto.getTotalBoletas()).isEqualTo(7L);
        assertThat(dto.getGananciasTotales()).isEqualTo(400.0); // 100 + 250.50 + 49.50
    }

    @Test
    @DisplayName("obtenerResumen() ignora boletas con importe_total nulo sin lanzar error")
    void resumen_ignoraImportesNulos() {
        when(userRepo.count()).thenReturn(1L);
        when(prodRepo.count()).thenReturn(1L);
        when(boletaRepo.count()).thenReturn(2L);
        Boleta sinTotal = new Boleta(); // importe_total = null
        when(boletaRepo.findAll()).thenReturn(List.of(boletaConTotal(80.0), sinTotal));

        DashboardDTO dto = dashboardService.obtenerResumen();

        assertThat(dto.getGananciasTotales()).isEqualTo(80.0);
    }

    @Test
    @DisplayName("topProductos() devuelve el ranking real y respeta el límite")
    void topProductos_devuelveRankingConLimite() {
        // [idproducto, descripcion, totalVendido]
        when(detalleRepo.topProductosVendidos()).thenReturn(List.of(
                new Object[]{1, "Casaca de cuero negra", 30L},
                new Object[]{2, "Zapatos Oxford",         18L},
                new Object[]{3, "Billetera clásica",      12L}
        ));

        List<Map<String, Object>> top = dashboardService.topProductos(2);

        assertThat(top).hasSize(2); // respeta el límite
        assertThat(top.get(0).get("descripcion")).isEqualTo("Casaca de cuero negra");
        assertThat(top.get(0).get("vendidos")).isEqualTo(30L);
        assertThat(top.get(1).get("vendidos")).isEqualTo(18L);
    }

    @Test
    @DisplayName("topProductos() devuelve lista vacía cuando no hay ventas")
    void topProductos_sinVentas() {
        when(detalleRepo.topProductosVendidos()).thenReturn(List.of());

        List<Map<String, Object>> top = dashboardService.topProductos(5);

        assertThat(top).isEmpty();
    }
}
