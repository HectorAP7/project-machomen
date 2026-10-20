package com.machomen.productos.controller;

import com.machomen.productos.model.Cupon;
import com.machomen.productos.service.CuponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    @Autowired
    private CuponService service;

    /** GET /api/cupones — lista todos (admin) */
    @GetMapping
    public ResponseEntity<List<Cupon>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    /** POST /api/cupones — crear (admin) */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Cupon c) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(c));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PUT /api/cupones/{id} — actualizar (admin) */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Cupon c) {
        try {
            return ResponseEntity.ok(service.actualizar(id, c));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PUT /api/cupones/estado/{id}/{estado} — activar/desactivar (admin) */
    @PutMapping("/estado/{id}/{estado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable Integer id, @PathVariable Integer estado) {
        try {
            service.cambiarEstado(id, estado);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/cupones/validar?codigo=MACHO10&subtotal=600
     * Lo usa el cliente en la pasarela. Devuelve si es válido y el descuento.
     */
    @GetMapping("/validar")
    public ResponseEntity<?> validar(@RequestParam String codigo,
                                     @RequestParam(defaultValue = "0") BigDecimal subtotal) {
        return ResponseEntity.ok(service.validar(codigo, subtotal));
    }
}
