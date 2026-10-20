# MachoMen — Guía Completa de Implementación

## Arquitectura implementada

```
Angular (4200) → API Gateway (8080) → [Eureka (8761)]
                                    ↓
                 ms-auth (8081) ← autenticación JWT
                 ms-productos (8082) ← Feign Client (Circuit Breaker)
                 ms-usuarios (8083)
                 ms-boletas (8084) → RabbitMQ → ms-notificaciones (8085)
```

## Tecnologías implementadas

| Tecnología | Dónde | Estado |
|---|---|---|
| Spring Cloud Netflix Eureka | eureka-server | ✅ Completo |
| API Gateway + JWT Filter | api-gateway | ✅ Completo |
| Spring Security (roles) | todos los ms | ✅ Completo |
| Feign Client | ms-boletas → ms-productos | ✅ Completo |
| Circuit Breaker (Resilience4j) | ms-boletas Feign | ✅ Completo |
| Retry (Resilience4j) | ms-boletas Feign | ✅ Completo |
| RabbitMQ Producer | ms-boletas | ✅ Completo |
| RabbitMQ Consumer | ms-notificaciones | ✅ Completo |
| Docker Compose | raíz del proyecto | ✅ Completo |
| Docker profiles | todos los ms | ✅ Completo |
| Kubernetes manifests | kubernetes/ | ✅ Completo |
| Prometheus Metrics | todos los ms | ✅ Completo |
| Actuator endpoints | todos los ms | ✅ Completo |
| Talla en boleta (BD) | tb_boleta_det | ✅ Completo |

## Orden de arranque LOCAL (STS)

1. MySQL corriendo
2. RabbitMQ corriendo (opcional si no usas notificaciones)
3. `eureka-server` → esperar que inicie
4. `ms-auth` → esperar que inicie
5. `ms-productos`, `ms-usuarios` (paralelo)
6. `ms-boletas`
7. `ms-notificaciones`
8. `api-gateway`
9. `ng serve` (Angular)

## Arranque con Docker Compose

```bash
cd backend/microservicios-actualizado

# Construir imágenes
docker-compose build

# Levantar todo
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps

# Bajar todo
docker-compose down
```

## Arranque con Kubernetes (minikube)

```bash
# Iniciar minikube
minikube start

# Construir imágenes localmente
eval $(minikube docker-env)
for ms in eureka-server api-gateway ms-auth ms-productos ms-usuarios ms-boletas ms-notificaciones; do
  docker build -t machomen/$ms:latest ./$ms
done

# Aplicar manifests
kubectl apply -f kubernetes/

# Ver pods
kubectl get pods -n machomen

# Port-forward del gateway
kubectl port-forward svc/api-gateway 8080:8080 -n machomen
```

## Circuit Breaker — cómo funciona

El `ProductoFeignClient` en ms-boletas tiene:
- **CircuitBreaker**: si ms-productos falla 5/10 llamadas → circuito abierto 30s
- **Retry**: reintenta 3 veces con backoff exponencial (500ms → 1s → 2s)
- **Fallback**: devuelve null y ms-boletas continúa (stock no verificado, no bloquea la venta)

Ver estado: `GET http://localhost:8084/actuator/circuitbreakers`

## RabbitMQ — flujo de mensajes

```
ms-boletas (producer) → exchange: machomen.direct.exchange
                      → routing-key: boleta.nueva
                      → queue: machomen.notificaciones.queue
                      → ms-notificaciones (consumer) → log (extensible a email)
```

Ver mensajes: http://localhost:15672 (guest/guest)

## Observabilidad — endpoints

| Endpoint | Descripción |
|---|---|
| `/actuator/health` | Estado del servicio |
| `/actuator/metrics` | Métricas |
| `/actuator/prometheus` | Métricas formato Prometheus |
| `/actuator/circuitbreakers` | Estado Circuit Breakers |
| `http://localhost:8761` | Eureka Dashboard |
| `http://localhost:15672` | RabbitMQ Management |

## Migración de base de datos

Si ya tienes la BD creada, ejecutar:
```sql
ALTER TABLE tb_boleta_det
ADD COLUMN talla VARCHAR(10) NULL AFTER importe;
```

Si es BD nueva, Hibernate (`ddl-auto: update`) la agrega automáticamente.
