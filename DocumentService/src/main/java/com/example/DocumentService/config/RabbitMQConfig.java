package com.example.DocumentService.config;

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
    @Value("${rabbitmq.queueJson3.name}")
    private String JsonQueue;
    @Value("${rabbitmq.exchange3.name}")
    private String exchange;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String JsonRoutingKey;

    @Bean
    public Queue JsonQueue() {
        return new Queue(JsonQueue); // durable = true
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchange);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding() {
        return BindingBuilder.bind(JsonQueue())
                .to(exchange())
                .with(JsonRoutingKey);
    }

    @Bean
    public MessageConverter converter(){
        return new Jackson2JsonMessageConverter();
    }
    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter());
        return rabbitTemplate;
    }
}
