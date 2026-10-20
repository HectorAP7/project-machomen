package com.machomen.auth.controller;

import com.machomen.auth.dto.LoginRequest;
import com.machomen.auth.model.Usuario;
import com.machomen.auth.repository.IUsuarioRepository;
import com.machomen.auth.security.JwtUtil;
import com.machomen.auth.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired private AuthService        authService;
    @Autowired private IUsuarioRepository usuarioRepo;
    @Autowired private JwtUtil            jwtUtil;

    // ── Login normal ─────────────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        try {
            return ResponseEntity.ok(authService.login(req));
        } catch (Exception e) {
            log.warn("Login fallido: {}", e.getMessage());
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ── Registro público de cliente ───────────────────────────────────────

    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        try {
            return ResponseEntity.ok(authService.registrar(usuario));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── Verificar token JWT (usado por Angular después del callback OAuth2) ──

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401).body("Token requerido");

            String token  = authHeader.substring(7);
            if (!jwtUtil.isValid(token))
                return ResponseEntity.status(401).body("Token inválido o expirado");

            String correo = jwtUtil.getClaims(token).getSubject();
            Optional<Usuario> u = usuarioRepo.findByCorreo(correo);
            if (u.isEmpty()) return ResponseEntity.status(404).body("Usuario no encontrado");

            Usuario usuario = u.get();
            usuario.setClave(null);
            return ResponseEntity.ok(Map.of("token", token, "usuario", usuario));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Error al verificar token: " + e.getMessage());
        }
    }
}
