package com.machomen.notificaciones.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${machomen.rabbitmq.exchange}")
    private String exchange;

    @Value("${machomen.rabbitmq.queue.notificaciones}")
    private String queueNotificaciones;

    @Bean
    FanoutExchange fanoutExchange() {
        return new FanoutExchange(exchange, true, false);
    }

    @Bean
    Queue queueNotificaciones() {
        return QueueBuilder.durable(queueNotificaciones).build();
    }

    @Bean
    Binding bindingNotificaciones(Queue queueNotificaciones, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(queueNotificaciones).to(fanoutExchange);
    }

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
