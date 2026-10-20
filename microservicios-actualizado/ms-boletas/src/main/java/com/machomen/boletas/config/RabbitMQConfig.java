package com.machomen.boletas.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Topología RabbitMQ MachoMen:
 *
 *   ms-boletas (Producer)
 *       │
 *       ▼
 *   machomen.fanout.exchange  (FanoutExchange)
 *       ├──► machomen.boletas.queue        → (reservado para futuro procesamiento)
 *       └──► machomen.notificaciones.queue → ms-notificaciones (Consumer)
 *
 * FanoutExchange: el mismo mensaje llega a TODAS las colas enlazadas.
 * No se usa routing key.
 */
@Configuration
public class RabbitMQConfig {

    @Value("${machomen.rabbitmq.exchange}")
    private String exchange;

    @Value("${machomen.rabbitmq.queue.boletas}")
    private String queueBoletas;

    @Value("${machomen.rabbitmq.queue.notificaciones}")
    private String queueNotificaciones;

    // ── Exchange ──────────────────────────────────────────────────────────────
    @Bean
    FanoutExchange fanoutExchange() {
        return new FanoutExchange(exchange, true, false);
    }

    // ── Colas durables ────────────────────────────────────────────────────────
    @Bean
    Queue queueBoletas() {
        return QueueBuilder.durable(queueBoletas).build();
    }

    @Bean
    Queue queueNotificaciones() {
        return QueueBuilder.durable(queueNotificaciones).build();
    }

    // ── Bindings: ambas colas escuchan el exchange ────────────────────────────
    @Bean
    Binding bindingBoletas(Queue queueBoletas, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(queueBoletas).to(fanoutExchange);
    }

    @Bean
    Binding bindingNotificaciones(Queue queueNotificaciones, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(queueNotificaciones).to(fanoutExchange);
    }

    // ── Serialización JSON ────────────────────────────────────────────────────
    @Bean
    MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory cf) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(jsonMessageConverter());
        return t;
    }
}
