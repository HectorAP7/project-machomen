package com.machomen.usuarios.service;

import com.machomen.usuarios.model.Usuario;
import com.machomen.usuarios.repository.IUsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    @Autowired private IUsuarioRepository repo;
    @Autowired private BCryptPasswordEncoder encoder;

    private String emailActual() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public Usuario obtenerPerfil() {
        String email = emailActual();
        return repo.findByCorreo(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email));
    }

    public Usuario obtenerPerfilById(int id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
    }

    @Transactional
    public Usuario actualizarPerfil(Usuario datos) {
        Usuario u = obtenerPerfil();
        if (datos.getNombres()   != null) u.setNombres(datos.getNombres());
        if (datos.getApellidos() != null) u.setApellidos(datos.getApellidos());
        if (datos.getDni()       != null && !datos.getDni().isEmpty()) {
            // Verify DNI is unique (not taken by another user)
            repo.findByDni(datos.getDni()).ifPresent(existing -> {
                if (!existing.getIdusuario().equals(u.getIdusuario()))
                    throw new RuntimeException("El DNI ya está en uso por otro usuario.");
            });
            u.setDni(datos.getDni());
        }
        if (datos.getDireccion() != null) u.setDireccion(datos.getDireccion());
        if (datos.getIddistrito() != null) u.setIddistrito(datos.getIddistrito() == 0 ? null : datos.getIddistrito());
        if (datos.getCelular()   != null) u.setCelular(datos.getCelular());
        if (datos.getClave()     != null && !datos.getClave().isEmpty()) {
            u.setClave(encoder.encode(datos.getClave()));
        }
        log.info("Perfil actualizado: {}", u.getCorreo());
        return repo.save(u);
    }

    @Transactional
    public Usuario actualizarPerfilById(int id, Usuario datos) {
        Usuario u = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
        if (datos.getNombres()   != null && !datos.getNombres().isEmpty())
            u.setNombres(datos.getNombres());
        if (datos.getApellidos() != null && !datos.getApellidos().isEmpty())
            u.setApellidos(datos.getApellidos());
        if (datos.getDni()       != null && !datos.getDni().isEmpty()) {
            repo.findByDni(datos.getDni()).ifPresent(existing -> {
                if (!existing.getIdusuario().equals(id))
                    throw new RuntimeException("El DNI ya está en uso.");
            });
            u.setDni(datos.getDni());
        }
        if (datos.getDireccion() != null) u.setDireccion(datos.getDireccion());
        if (datos.getIddistrito() != null) u.setIddistrito(datos.getIddistrito() == 0 ? null : datos.getIddistrito());
        if (datos.getCelular()   != null) u.setCelular(datos.getCelular());
        if (datos.getClave()     != null && !datos.getClave().isEmpty()) {
            u.setClave(encoder.encode(datos.getClave()));
        }
        log.info("Perfil #{} actualizado por admin", id);
        return repo.save(u);
    }

    public List<Usuario> listarTodos() {
        return repo.findAll();
    }

    public List<Usuario> listarPorRol(int rol) {
        return repo.findAll().stream()
                .filter(u -> u.getRol() != null && u.getRol() == rol)
                .toList();
    }

    @Transactional
    public Usuario crearUsuario(Usuario datos) {
        if (repo.findByCorreo(datos.getCorreo()).isPresent())
            throw new RuntimeException("Ya existe un usuario con ese correo.");
        if (repo.findByDni(datos.getDni()).isPresent())
            throw new RuntimeException("Ya existe un usuario con ese DNI.");
        datos.setClave(encoder.encode(datos.getClave()));
        datos.setEstado(1);
        datos.setFechaReg(LocalDateTime.now());
        return repo.save(datos);
    }

    @Transactional
    public Usuario actualizarAdmin(int id, Usuario datos) {
        Usuario u = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
        u.setNombres(datos.getNombres());
        u.setApellidos(datos.getApellidos());
        u.setDni(datos.getDni());
        u.setCorreo(datos.getCorreo());
        u.setDireccion(datos.getDireccion());
        u.setIddistrito(datos.getIddistrito());
        u.setRol(datos.getRol());
        u.setEstado(datos.getEstado());
        return repo.save(u);
    }

    @Transactional
    public void cambiarEstado(int id, int estado) {
        Usuario u = repo.findById(id).orElseThrow();
        u.setEstado(estado);
        repo.save(u);
        log.info("Usuario #{} estado -> {}", id, estado);
    }

    @Transactional
    public void eliminarLogico(int id) {
        Usuario u = repo.findById(id).orElseThrow();
        u.setEstado(0);
        repo.save(u);
        log.info("Usuario #{} desactivado", id);
    }
}
