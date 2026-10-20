# MachoMen Microservicios

## Arquitectura

```
Angular :4200
    │
    ▼
API Gateway :8080  ← JWT Filter centralizado
    ├── ms-auth        :8081  (Login / Registro)
    ├── ms-productos   :8082  (Catálogo, Categorías, Distritos)
    ├── ms-usuarios    :8083  (Perfil, Admin usuarios)
    ├── ms-boletas     :8084  (Boletas, Dashboard) ──Feign──► ms-productos
    └── ms-notificaciones :8085  ◄──RabbitMQ── ms-boletas

Eureka Server  :8761  (Registro y descubrimiento)
MySQL          :3306
RabbitMQ       :5672 / UI :15672
```

## Tecnologías

| Componente | Versión |
|---|---|
| Java | 21 |
| Spring Boot | 3.2.5 |
| Spring Cloud | 2023.0.1 |
| Spring Cloud Gateway | Reactivo (WebFlux) |
| Eureka | Netflix OSS |
| OpenFeign | Spring Cloud |
| RabbitMQ | 3.12 |
| MySQL | 8.0 |
| Docker | Compose v3.8 |

## Puertos

| Servicio | Puerto |
|---|---|
| API Gateway | 8080 |
| Eureka Server | 8761 |
| ms-auth | 8081 |
| ms-productos | 8082 |
| ms-usuarios | 8083 |
| ms-boletas | 8084 |
| ms-notificaciones | 8085 |
| MySQL | 3306 |
| RabbitMQ AMQP | 5672 |
| RabbitMQ UI | 15672 |

## Opción A — STS 5 (desarrollo local)

### Prerrequisitos
- Java 21 instalado
- MySQL 8 corriendo en localhost:3306 con usuario root/123456
- RabbitMQ corriendo en localhost:5672 (usuario guest/guest)
- Base de datos `bd_machomen` creada (ejecutar el SQL del proyecto)

### Importar en STS 5
1. `File → Import → Existing Maven Projects`
2. Seleccionar la carpeta `machomen-microservicios`
3. Marcar todos los proyectos → `Finish`
4. Esperar que Maven descargue dependencias

### Orden de arranque (Run As → Spring Boot App)
```
1. eureka-server      → verificar: http://localhost:8761
2. ms-auth            → esperar registro en Eureka
3. ms-productos       → esperar registro en Eureka
4. ms-usuarios        → esperar registro en Eureka
5. ms-boletas         → esperar registro en Eureka
6. ms-notificaciones  → esperar registro en Eureka
7. api-gateway        → último en arrancar
```

### Verificar que todo funciona
- Eureka Dashboard:       http://localhost:8761
- RabbitMQ Management:    http://localhost:15672  (guest/guest)
- Login test:
  ```bash
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"correo":"admin@machomen.com","clave":"123456"}'
  ```

## Opción B — Docker Compose (producción)

```bash
# Construir y levantar todo
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f

# Ver estado de los contenedores
docker-compose ps

# Parar todo
docker-compose down

# Parar y limpiar volúmenes (borra datos MySQL y RabbitMQ)
docker-compose down -v
```

## Flujo JWT

```
1. Angular POST /api/auth/login → ms-auth genera JWT
2. Angular guarda { token, usuario } en localStorage
3. Angular envía: Authorization: Bearer <token> en cada request
4. API Gateway intercepta → JwtAuthFilter valida el token
5. Gateway inyecta: X-User-Email y X-User-Rol como headers internos
6. Microservicios leen esos headers → construyen SecurityContext
```

## Flujo RabbitMQ

```
ms-boletas registra boleta
    │
    ▼ rabbitTemplate.convertAndSend(exchange, "", evento)
    │
    ▼
machomen.fanout.exchange
    ├──► machomen.boletas.queue        (reservado)
    └──► machomen.notificaciones.queue
              │
              ▼ @RabbitListener
           ms-notificaciones
           └── logs boleta recibida
               (extensible: email, SMS, push)
```

## Flujo Feign

```
ms-boletas registra boleta
    │
    ▼ productoClient.obtenerProducto(id)  — via nombre Eureka
    │
    ▼ lb://ms-productos → Spring Cloud LoadBalancer resuelve IP
    │
    ▼ GET http://ms-productos:8082/api/productos/{id}
```

## API Endpoints

### Auth (público)
| Método | URL | Body |
|---|---|---|
| POST | /api/auth/login | `{"correo":"...","clave":"..."}` |
| POST | /api/auth/registrar | Usuario JSON |

### Productos (público)
| Método | URL |
|---|---|
| GET | /api/productos?nombre=&idcategoria= |
| GET | /api/productos/{id} |
| POST | /api/productos |
| PUT | /api/productos |
| PUT | /api/productos/estado/{id}/{estado} |
| POST | /api/productos/cambiar-estado |
| DELETE | /api/productos/{id} |
| GET | /api/categorias |
| GET | /api/categorias/admin |
| GET | /api/categorias/{id} |
| POST | /api/categorias |
| PUT | /api/categorias |
| GET | /api/distritos |

### Usuarios (requiere JWT)
| Método | URL |
|---|---|
| GET | /api/usuarios/mi-perfil |
| PUT | /api/usuarios/mi-perfil |
| GET | /api/usuarios |
| PUT | /api/usuarios/actualizar-mantenimiento/{id} |
| PUT | /api/usuarios/estado/{id}/{estado} |
| DELETE | /api/usuarios/eliminar/{id} |

### Boletas (requiere JWT)
| Método | URL |
|---|---|
| POST | /api/boletas/registrar |
| GET | /api/boletas/cliente/{idUsuario} |
| GET | /api/boletas/listar |
| GET | /api/boletas/detalle/{id} |
| GET | /api/boletas/reporte/{id} |
| PUT | /api/boletas/cambiar-estado/{id}/{estado} |
| GET | /api/dashboard/resumen |

## Credenciales por defecto

| Usuario | Correo | Clave | Rol |
|---|---|---|---|
| Admin General | admin@machomen.com | 123456 | ADMIN |
| Diego Bertie | diego@gmail.com | 123456 | CLIENTE |
