package com.machomen.boletas.client;

import com.machomen.boletas.model.Producto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

/**
 * Feign Client hacia ms-productos.
 * Circuit Breaker: si ms-productos falla 5 veces → abre el circuito por 30s.
 * Retry: reintenta 3 veces con 500ms de espera entre intentos.
 */
@FeignClient(name = "ms-productos")
public interface ProductoFeignClient {

    Logger log = LoggerFactory.getLogger(ProductoFeignClient.class);

    @GetMapping("/api/productos/{id}")
    @CircuitBreaker(name = "ms-productos", fallbackMethod = "fallbackObtenerProducto")
    @Retry(name = "ms-productos")
    Producto obtenerProducto(@PathVariable Integer id);

    @PutMapping("/api/productos/estado/{id}/{estado}")
    @CircuitBreaker(name = "ms-productos", fallbackMethod = "fallbackCambiarEstado")
    void cambiarEstado(@PathVariable Integer id, @PathVariable Integer estado);

    default Producto fallbackObtenerProducto(Integer id, Throwable t) {
        log.warn("Circuit Breaker activado para obtenerProducto({}): {}", id, t.getMessage());
        return null; // BoletaService maneja null con gracia
    }

    default void fallbackCambiarEstado(Integer id, Integer estado, Throwable t) {
        log.warn("Circuit Breaker activado para cambiarEstado({}, {}): {}", id, estado, t.getMessage());
    }
}
