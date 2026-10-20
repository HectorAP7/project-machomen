package com.machomen.auth.service;

import com.machomen.auth.model.Usuario;
import com.machomen.auth.repository.IUsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthService.class);

    @Autowired
    private IUsuarioRepository repo;

    public Usuario buscarOCrear(String email, String nombre, String apellido, String picture) {

        Optional<Usuario> existente = repo.findByCorreo(email.toLowerCase());
        if (existente.isPresent()) {
            log.info("Usuario Google ya existe: {}", email);
            return existente.get();
        }

        Usuario nuevo = new Usuario();
        nuevo.setCorreo(email.toLowerCase());
        nuevo.setNombres(nombre   != null ? nombre   : email.split("@")[0]);
        nuevo.setApellidos(apellido != null ? apellido : "");

        // DNI temporal único de 8 chars
        String dniTemporal;
        do {
            dniTemporal = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        } while (repo.existsByDni(dniTemporal));
        nuevo.setDni(dniTemporal);

        nuevo.setClave("GOOGLE_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16));
        nuevo.setRol(2);
        nuevo.setEstado(1);
        nuevo.setFechaReg(LocalDateTime.now());

        Usuario guardado = repo.save(nuevo);
        log.info("Nuevo usuario creado desde Google: {} (id={})", email, guardado.getIdusuario());
        return guardado;
    }
}
