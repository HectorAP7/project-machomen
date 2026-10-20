package com.machomen.boletas.controller;

import com.machomen.boletas.dto.BoletaRequest;
import com.machomen.boletas.service.BoletaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/boletas")
public class BoletaController {

    @Autowired
    private BoletaService boletaService;

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody BoletaRequest req) {
        try {
            return ResponseEntity.ok(boletaService.registrarBoleta(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "mensaje", e.getMessage(), "idBoleta", 0));
        }
    }

    /** GET /api/boletas/cliente/{idUsuario} — historial del cliente */
    @GetMapping("/cliente/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable int idUsuario) {
        try {
            return ResponseEntity.ok(boletaService.listarPorUsuarioFlat(idUsuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/boletas/listar — todas (admin/vendedor) */
    @GetMapping("/listar")
    public ResponseEntity<?> listarTodas() {
        try {
            return ResponseEntity.ok(boletaService.listarTodasFlat());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/boletas/detalle/{id} */
    @GetMapping("/detalle/{id}")
    public ResponseEntity<?> detalle(@PathVariable int id) {
        try {
            return ResponseEntity.ok(boletaService.obtenerDetalleFlat(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/boletas/cambiar-estado/{id}/{estado}
     * FIX: Ahora devuelve JSON en lugar de String para evitar
     * que el frontend lo interprete como error de parseo.
     */
    @PutMapping("/cambiar-estado/{id}/{estado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable int id, @PathVariable int estado) {
        try {
            return ResponseEntity.ok(boletaService.cambiarEstado(id, estado));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "mensaje", e.getMessage()));
        }
    }
}
