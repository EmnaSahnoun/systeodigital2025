package com.example.Activity_Service.config;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.interceptor.RetryOperationsInterceptor;

@Configuration
public class RabbitMQConfig {
    @Value("${rabbitmq.queueJson.name}")
    private String JsonQueue;
    @Value("${rabbitmq.exchange.name}")
    private String exchange;
    @Value("${rabbitmq.routing.json.key.name}")
    private String JsonRoutingKey;

    @Value("${rabbitmq.queueJson2.name}")
    private String JsonQueue2;
    @Value("${rabbitmq.exchange2.name}")
    private String exchange2;
    @Value("${rabbitmq.routing.json.key2.name}")
    private String JsonRoutingKey2;
    @Value("${rabbitmq.queueJson3.name}")
    private String JsonQueue3;
    @Value("${rabbitmq.exchange3.name}")
    private String exchange3;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String JsonRoutingKey3;

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
    public Queue JsonQueue2() {
        return new Queue(JsonQueue2); // durable = true
    }

    @Bean
    public TopicExchange exchange2() {
        return new TopicExchange(exchange2);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding2() {
        return BindingBuilder.bind(JsonQueue2())
                .to(exchange2())
                .with(JsonRoutingKey2);
    }
    @Bean
    public Queue JsonQueue3() {
        return new Queue(JsonQueue3); // durable = true
    }

    @Bean
    public TopicExchange exchange3() {
        return new TopicExchange(exchange3);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding3() {
        return BindingBuilder.bind(JsonQueue3())
                .to(exchange3())
                .with(JsonRoutingKey3);
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
