package com.machomen.productos.controller;

import com.machomen.productos.dto.CategoriaDTO;
import com.machomen.productos.model.Categoria;
import com.machomen.productos.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    @Autowired
    private ProductoService service;

    /** GET /api/categorias — catálogo con conteo (Angular tienda) */
    @GetMapping
    public ResponseEntity<List<CategoriaDTO>> listarParaCatalogo() {
        return ResponseEntity.ok(service.listarCategoriasParaCatalogo());
    }

    /** GET /api/categorias/admin — lista completa (Angular admin) */
    @GetMapping("/admin")
    public ResponseEntity<List<Categoria>> listarAdmin() {
        return ResponseEntity.ok(service.listarCategoriasAdmin());
    }

    /** GET /api/categorias/{id} — para formulario de edición */
    @GetMapping("/{id}")
    public ResponseEntity<Categoria> obtener(@PathVariable int id) {
        return service.obtenerCategoriaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** POST /api/categorias — crear nueva */
    @PostMapping
    public ResponseEntity<Categoria> crear(@RequestBody Categoria c) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.guardarCategoria(c));
    }

    /** PUT /api/categorias — actualizar existente */
    @PutMapping
    public ResponseEntity<Categoria> actualizar(@RequestBody Categoria c) {
        return ResponseEntity.ok(service.guardarCategoria(c));
    }

    /** PUT /api/categorias/estado/{id}/{estado} */
    @PutMapping("/estado/{id}/{estado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable int id, @PathVariable int estado) {
        service.cambiarEstadoCategoria(id, estado);
        return ResponseEntity.ok(true);
    }
}
