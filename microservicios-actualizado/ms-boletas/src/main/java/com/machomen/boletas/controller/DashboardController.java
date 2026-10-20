package com.machomen.boletas.controller;

import com.machomen.boletas.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/resumen")
    public ResponseEntity<?> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }

    /**
     * GET /api/dashboard/top-productos?limite=5
     * Productos más vendidos (datos reales de tb_boleta_det, boletas aprobadas).
     */
    @GetMapping("/top-productos")
    public ResponseEntity<?> topProductos(@RequestParam(defaultValue = "5") int limite) {
        return ResponseEntity.ok(dashboardService.topProductos(limite));
    }
}
