package com.machomen.auth.service;

import com.machomen.auth.dto.LoginRequest;
import com.machomen.auth.dto.LoginResponse;
import com.machomen.auth.model.Usuario;
import com.machomen.auth.repository.IUsuarioRepository;
import com.machomen.auth.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired private IUsuarioRepository repo;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private BCryptPasswordEncoder encoder;

    public LoginResponse login(LoginRequest req) {
        Usuario u = repo.findByCorreo(req.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        if (u.getEstado() == 0)
            throw new RuntimeException("Cuenta desactivada");

        if (!encoder.matches(req.getClave(), u.getClave()))
            throw new RuntimeException("Credenciales incorrectas");

        String token = jwtUtil.generateToken(u.getIdusuario(), u.getCorreo(), u.getRol());
        log.info("LOGIN OK: {} rol={}", u.getCorreo(), u.getRol());

        // Limpiar hash antes de enviarlo al frontend
        u.setClave(null);
        return new LoginResponse(token, u);
    }

    @Transactional
    public Usuario registrar(Usuario u) {
        if (repo.existsByCorreo(u.getCorreo()))
            throw new RuntimeException("Correo ya registrado");
        if (repo.existsByDni(u.getDni()))
            throw new RuntimeException("DNI ya registrado");

        u.setClave(encoder.encode(u.getClave()));
        u.setRol(2);
        u.setEstado(1);
        u.setFechaReg(LocalDateTime.now());
        log.info("REGISTRO: nuevo usuario {}", u.getCorreo());
        return repo.save(u);
    }
}
