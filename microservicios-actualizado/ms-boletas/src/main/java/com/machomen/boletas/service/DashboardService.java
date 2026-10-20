package com.machomen.boletas.service;

import com.machomen.boletas.dto.DashboardDTO;
import com.machomen.boletas.repository.IBoletaDetalleRepository;
import com.machomen.boletas.repository.IBoletaRepository;
import com.machomen.boletas.repository.IProductoRepository;
import com.machomen.boletas.repository.IUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired private IUsuarioRepository       userRepo;
    @Autowired private IProductoRepository      prodRepo;
    @Autowired private IBoletaRepository        boletaRepo;
    @Autowired private IBoletaDetalleRepository detalleRepo;

    public DashboardDTO obtenerResumen() {
        long usuarios  = userRepo.count();
        long productos = prodRepo.count();
        long boletas   = boletaRepo.count();
        double ganancias = boletaRepo.findAll().stream()
                .mapToDouble(b -> b.getImporte_total() != null ? b.getImporte_total().doubleValue() : 0)
                .sum();
        return new DashboardDTO(usuarios, productos, boletas, ganancias);
    }

    /**
     * Top N productos más vendidos (datos REALES sumando tb_boleta_det
     * de boletas aprobadas). Cada item: { idproducto, descripcion, vendidos }.
     */
    public List<Map<String, Object>> topProductos(int limite) {
        List<Object[]> filas = detalleRepo.topProductosVendidos();
        List<Map<String, Object>> top = new ArrayList<>();
        for (Object[] fila : filas) {
            if (top.size() >= limite) break;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("idproducto",  fila[0]);
            m.put("descripcion", fila[1]);
            m.put("vendidos",    ((Number) fila[2]).longValue());
            top.add(m);
        }
        return top;
    }
}
