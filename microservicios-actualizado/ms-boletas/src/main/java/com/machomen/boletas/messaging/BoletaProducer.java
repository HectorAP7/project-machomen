package com.machomen.boletas.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Producer RabbitMQ.
 * Publica BoletaEventoDTO en JSON al exchange configurado.
 * FanoutExchange → ambas colas (boletas + notificaciones) reciben el mensaje.
 */
@Component
public class BoletaProducer {

    private static final Logger log = LoggerFactory.getLogger(BoletaProducer.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${machomen.rabbitmq.exchange}")
    private String exchange;

    public void publicar(BoletaEventoDTO evento) {
        // routingKey vacío porque FanoutExchange ignora la routing key
        rabbitTemplate.convertAndSend(exchange, "", evento);
        log.info("RabbitMQ >> Boleta #{} publicada en exchange [{}]", evento.getIdBoleta(), exchange);
    }
}
