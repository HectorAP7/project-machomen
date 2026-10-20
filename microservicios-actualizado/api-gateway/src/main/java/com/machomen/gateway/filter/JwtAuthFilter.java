package com.machomen.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Filtro JWT centralizado en el API Gateway (WebFlux reactivo).
 * Se aplica SOLO a las rutas marcadas con "- name: JwtAuthFilter" en application.yml.
 * Las rutas públicas (/api/auth/**) NO tienen este filtro.
 *
 * Al validar el token, inyecta headers internos:
 *   X-User-Email: correo del usuario
 *   X-User-Rol:   rol numérico (1=ADMIN, 2=CLIENTE)
 */
@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getPath().toString();
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("GATEWAY >> Sin token en ruta protegida: {}", path);
                return sendUnauthorized(exchange, "Token requerido");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.isValid(token)) {
                log.warn("GATEWAY >> Token invalido o expirado: {}", path);
                return sendUnauthorized(exchange, "Token invalido o expirado");
            }

            String correo = jwtUtil.getSubject(token);
            Integer rol   = jwtUtil.getRol(token);
            log.debug("GATEWAY >> JWT OK: {} rol={} -> {}", correo, rol, path);

            // Propagar identidad del usuario a los microservicios downstream
            ServerHttpRequest mutated = request.mutate()
                    .header("X-User-Email", correo)
                    .header("X-User-Rol",   String.valueOf(rol))
                    .header("X-User-Id",    String.valueOf(jwtUtil.getId(token)))
                    .build();

            return chain.filter(exchange.mutate().request(mutated).build());
        };
    }

    private Mono<Void> sendUnauthorized(ServerWebExchange exchange, String msg) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        byte[] bytes = ("{\"error\":\"" + msg + "\"}").getBytes();
        var buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    public static class Config {
        // Sin parámetros de configuración
    }
}
