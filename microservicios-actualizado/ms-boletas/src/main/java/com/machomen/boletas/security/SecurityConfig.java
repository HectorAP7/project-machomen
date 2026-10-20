package com.machomen.boletas.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

/**
 * Seguridad ms-boletas:
 * - El Gateway ya validó el JWT e inyecta X-User-Email y X-User-Rol.
 * - Clientes (rol 2) solo pueden ver sus propias boletas.
 * - Admin (rol 1) y Vendedor (rol 3) pueden ver y modificar todas.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, GatewayHeaderFilter headerFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/boletas/listar").hasAnyRole("ADMIN", "VENDEDOR")
                .requestMatchers(HttpMethod.PUT, "/api/boletas/cambiar-estado/**").hasAnyRole("ADMIN", "VENDEDOR")
                .requestMatchers(HttpMethod.GET, "/api/boletas/cliente/**").hasAnyRole("CLIENTE", "ADMIN", "VENDEDOR")
                .requestMatchers(HttpMethod.GET, "/api/boletas/detalle/**").hasAnyRole("CLIENTE", "ADMIN", "VENDEDOR")
                .requestMatchers(HttpMethod.POST, "/api/boletas/registrar").hasAnyRole("CLIENTE", "ADMIN")
                .requestMatchers("/api/dashboard/**").hasAnyRole("ADMIN", "VENDEDOR")
                .anyRequest().authenticated()
            )
            .addFilterBefore(headerFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Component
    public static class GatewayHeaderFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            String email  = req.getHeader("X-User-Email");
            String rolStr = req.getHeader("X-User-Rol");
            String userId = req.getHeader("X-User-Id");
            if (email != null && !email.isBlank()) {
                String role = switch (rolStr != null ? rolStr : "2") {
                    case "1" -> "ROLE_ADMIN";
                    case "3" -> "ROLE_VENDEDOR";
                    default  -> "ROLE_CLIENTE";
                };
                var auth = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority(role)));
                auth.setDetails(userId); // ID de usuario disponible en el contexto
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
            chain.doFilter(req, res);
        }
    }
}
