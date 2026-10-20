package com.machomen.notificaciones.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumer RabbitMQ de ms-notificaciones.
 *
 * Escucha la cola "machomen.notificaciones.queue".
 * Cada vez que ms-boletas registra una boleta, este método
 * se ejecuta automáticamente de forma ASÍNCRONA.
 *
 * Extensible para: email (Spring Mail), SMS (Twilio), push notifications, etc.
 */
@Component
public class NotificacionConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificacionConsumer.class);

    @RabbitListener(queues = "${machomen.rabbitmq.queue.notificaciones}")
    public void recibirBoleta(BoletaEventoDTO evento) {
        log.info("═══════════════════════════════════════════════════");
        log.info("📬 NOTIFICACIÓN RECIBIDA — ms-notificaciones");
        log.info("   Boleta #    : {}", evento.getIdBoleta());
        log.info("   Cliente     : {} (ID: {})", evento.getNombreUsuario(), evento.getIdUsuario());
        log.info("   Correo      : {}", evento.getCorreoUsuario());
        log.info("   Total       : S/ {}", evento.getImporteTotal());
        log.info("   Tipo pago   : {}", tipoPagoLabel(evento.getTipoPago()));
        log.info("   Nro op.     : {}", evento.getNroOperacion());
        log.info("   Fecha       : {}", evento.getFecha());
        log.info("   Items       : {}", evento.getCantidadItems());
        log.info("═══════════════════════════════════════════════════");

        // TODO: enviar email de confirmación al cliente
        // emailService.enviarConfirmacion(evento.getCorreoUsuario(), evento);

        // TODO: notificar al área de despacho
        // despachoService.crearOrdenEnvio(evento);

        log.info("✅ Notificación procesada para boleta #{}", evento.getIdBoleta());
    }

    private String tipoPagoLabel(Integer tipoPago) {
        if (tipoPago == null) return "Desconocido";
        return switch (tipoPago) {
            case 1  -> "Yape";
            case 2  -> "Plin";
            case 3  -> "Tarjeta";
            default -> "Otro (" + tipoPago + ")";
        };
    }
}
