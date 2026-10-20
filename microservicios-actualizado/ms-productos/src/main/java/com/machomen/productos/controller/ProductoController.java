package com.machomen.productos.controller;

import com.machomen.productos.model.Producto;
import com.machomen.productos.service.ProductoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final Logger log = LoggerFactory.getLogger(ProductoController.class);

    @Autowired
    private ProductoService service;

    @GetMapping
    public ResponseEntity<List<Producto>> listar(
            @RequestParam(required = false, defaultValue = "") String nombre,
            @RequestParam(required = false, defaultValue = "0") Integer idcategoria) {
        return ResponseEntity.ok(service.filtrar(nombre, idcategoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Integer id) {
        Producto p = service.obtenerPorId(id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto p) {
        return ResponseEntity.ok(service.guardar(p));
    }

    /**
     * PUT /api/productos/{id}
     * CORREGIDO: ahora el id viene en el path para evitar ambigüedades.
     * El Angular llama: this.http.put(`${BASE}/productos/${p.idproducto}`, payload)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Integer id, @RequestBody Producto p) {
        if (!service.existe(id)) return ResponseEntity.notFound().build();
        p.setIdproducto(id); // asegurar que el id del path se use
        return ResponseEntity.ok(service.guardar(p));
    }

    /** PUT /api/productos/estado/{id}/{estado} — usado por Feign desde ms-boletas */
    @PutMapping("/estado/{id}/{estado}")
    public ResponseEntity<?> cambiarEstadoPath(@PathVariable int id, @PathVariable int estado) {
        service.cambiarEstado(id, estado);
        return ResponseEntity.ok(true);
    }

    /** POST /api/productos/cambiar-estado — usado por Angular Admin */
    @PostMapping("/cambiar-estado")
    public ResponseEntity<?> cambiarEstadoBody(@RequestBody Map<String, Object> body) {
        Integer id = (Integer) body.get("id");
        Boolean activo = (Boolean) body.get("activo");
        if (id == null || activo == null) return ResponseEntity.badRequest().body("id y activo son requeridos");
        service.cambiarEstadoBody(id, activo);
        return ResponseEntity.ok(true);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (!service.existe(id)) return ResponseEntity.notFound().build();
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
