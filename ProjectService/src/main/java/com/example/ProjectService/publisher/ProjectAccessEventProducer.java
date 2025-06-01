package com.example.ProjectService.publisher;

import com.example.ProjectService.dto.request.ClientCreationMessage;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.services.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
public class ProjectAccessEventProducer {
    @Value("${rabbitmq.exchange4.name}")
    private String exchange;
    @Value("${rabbitmq.routing.json.key4.name}")
    private String routingKeyJson;
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private ObjectMapper objectMapper;
    private static  final Logger LOGGER= LoggerFactory.getLogger(ProjectAccessEventProducer.class);
    public ProjectAccessEventProducer(RabbitTemplate rabbitTemplate,ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }
    public void sendClientCreationMessage(ProjectAccess projectAccess,String authToken) {
        try {
            ClientCreationMessage message = new ClientCreationMessage();
                  message.setUserId(  projectAccess.getIdUser());
                    message.setEmail(projectAccess.getEmailUser());
                    message.setName("");
                    message.setCompanyId(projectAccess.getProject().getIdCompany());
                    message.setCompanyName(projectAccess.getProject().getCompanyName());
                    message.setAuthToken(authToken);

            String jsonMessage = objectMapper.writeValueAsString(message);
            LOGGER.info(String.format("Json message sent -> %s", jsonMessage));

            rabbitTemplate.convertAndSend(exchange, routingKeyJson, jsonMessage);
        }
        catch (Exception e) {
            LOGGER.error("errerur while sending file in message", e);
        }

    }
}

