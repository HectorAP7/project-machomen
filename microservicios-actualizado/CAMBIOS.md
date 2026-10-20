# MachoMen Backend — Correcciones aplicadas

1. **ms-productos / Producto.java**: el campo `tallaJson` ahora se serializa como `talla_json`
   (`@JsonProperty`) y acepta ambos nombres al guardar (`@JsonAlias`).
   ESTE era el motivo por el que Angular no mostraba las tallas de casacas y zapatos.
2. **ms-boletas / BoletaService.java**: el detalle de boleta ahora incluye la clave `talla_json`
   ademas de `tallaJson` para compatibilidad con el frontend.

Orden de arranque: eureka-server → api-gateway → ms-auth → ms-productos → ms-boletas → ms-usuarios → ms-notificaciones
