package com.example.ProjectService.config;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.DefaultClassMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
@Configuration
public class RabbitMQConfig {
        /*@Value("${rabbitmq.queue.name}")
        private String queue;*/
        @Value("${rabbitmq.queueJson.name}")
        private String JsonQueue;
        @Value("${rabbitmq.exchange.name}")
        private String exchange;
        @Value("${rabbitmq.routing.json.key.name}")
        private String JsonRoutingKey;

    @Value("${rabbitmq.queueJson3.name}")
    private String JsonQueue3;
    @Value("${rabbitmq.exchange3.name}")
    private String exchange3;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String JsonRoutingKey3;

    @Value("${rabbitmq.queueJson4.name}")
    private String JsonQueue4;
    @Value("${rabbitmq.exchange4.name}")
    private String exchange4;
    @Value("${rabbitmq.routing.json.key4.name}")
    private String JsonRoutingKey4;
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
    public Queue JsonQueue4() {
        return new Queue(JsonQueue4); // durable = true
    }

    @Bean
    public TopicExchange exchange4() {
        return new TopicExchange(exchange4);
    }

    //binding between JsonQueue and exchange using routing key
    @Bean
    public Binding jsonBinding4() {
        return BindingBuilder.bind(JsonQueue4())
                .to(exchange4())
                .with(JsonRoutingKey4);
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