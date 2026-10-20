package com.machomen.usuarios.controller;

import com.machomen.usuarios.model.Usuario;
import com.machomen.usuarios.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // ── Perfil propio (basado en JWT) ────────────────────────────
    @GetMapping("/mi-perfil")
    public ResponseEntity<?> getPerfil() {
        try { return ResponseEntity.ok(service.obtenerPerfil()); }
        catch (Exception e) { return ResponseEntity.status(401).body(e.getMessage()); }
    }

    @PutMapping("/mi-perfil")
    public ResponseEntity<?> updatePerfil(@RequestBody Usuario u) {
        try { return ResponseEntity.ok(service.actualizarPerfil(u)); }
        catch (Exception e) { return ResponseEntity.status(401).body(e.getMessage()); }
    }

    // ── Perfil por ID (usado por Angular perfil.ts) ────────────────
    @GetMapping("/perfil/{id}")
    public ResponseEntity<?> getPerfilById(@PathVariable int id) {
        try { return ResponseEntity.ok(service.obtenerPerfilById(id)); }
        catch (Exception e) { return ResponseEntity.status(404).body(e.getMessage()); }
    }

    @PutMapping("/perfil/{id}")
    public ResponseEntity<?> updatePerfilById(@PathVariable int id, @RequestBody Usuario u) {
        try { return ResponseEntity.ok(service.actualizarPerfilById(id, u)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    // ── Admin: listar ─────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/vendedores")
    public ResponseEntity<?> listarVendedores() {
        return ResponseEntity.ok(service.listarPorRol(3));
    }

    @GetMapping("/clientes")
    public ResponseEntity<?> listarClientes() {
        return ResponseEntity.ok(service.listarPorRol(2));
    }

    // ── Admin: crear vendedor ─────────────────────────────────────
    @PostMapping("/vendedor")
    public ResponseEntity<?> crearVendedor(@RequestBody Usuario u) {
        try {
            u.setRol(3);
            return ResponseEntity.ok(service.crearUsuario(u));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    // Alias para compatibilidad
    @PostMapping("/crear-vendedor")
    public ResponseEntity<?> crearVendedorAlias(@RequestBody Usuario u) {
        return crearVendedor(u);
    }

    @PutMapping("/actualizar-mantenimiento/{id}")
    public ResponseEntity<?> actualizarAdmin(@PathVariable int id, @RequestBody Usuario u) {
        return ResponseEntity.ok(service.actualizarAdmin(id, u));
    }

    @PutMapping("/estado/{id}/{estado}")
    public ResponseEntity<?> cambiarEstado(@PathVariable int id, @PathVariable int estado) {
        service.cambiarEstado(id, estado);
        return ResponseEntity.ok(java.util.Map.of("success", true, "id", id, "estado", estado));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<?> eliminar(@PathVariable int id) {
        service.eliminarLogico(id);
        return ResponseEntity.ok("Usuario desactivado");
    }
}
