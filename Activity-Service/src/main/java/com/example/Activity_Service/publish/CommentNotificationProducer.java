package com.example.Activity_Service.publish;

import com.example.Activity_Service.dto.response.NotificationDto;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentNotificationProducer {
    private final RabbitTemplate rabbitTemplate;
    

    @Value("${rabbitmq.exchange2.name}")
    private String exchange;

    @Value("${rabbitmq.routing.json.key2.name}")
    private String routingKey;
    private static  final Logger LOGGER= LoggerFactory.getLogger(CommentNotificationProducer.class);


    public void sendNotification(NotificationDto notificationDto) {
        rabbitTemplate.convertAndSend(exchange, routingKey, notificationDto);

        LOGGER.info("Notification sent to RabbitMQ: {}", notificationDto);
    }
}
