package com.example.DocumentService.publisher;

import com.example.DocumentService.dto.response.DocumentDTO;
import com.example.DocumentService.model.MediaFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class FileEventProducer {
    @Value("${rabbitmq.exchange3.name}")
    private String exchange;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String routingKeyJson;
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private ObjectMapper objectMapper;
    private static  final Logger LOGGER= LoggerFactory.getLogger(FileEventProducer.class);

    public FileEventProducer(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    public void sendFileinMessage(MediaFile file,String authToken) {
        try{
            DocumentDTO event = new DocumentDTO();
            event.setTaskId(file.getTaskId());
            event.setUsername(file.getUploadedBy());
            event.setAction(file.getAction());
            event.setTimestamp(file.getUploadDate());
            event.setFilename(file.getFilename());
            event.setAuthToken(authToken);
            String jsonMessage = objectMapper.writeValueAsString(event);
            LOGGER.info(String.format("Json message sent -> %s", jsonMessage));

            rabbitTemplate.convertAndSend(exchange, routingKeyJson, jsonMessage);
        }
        catch(Exception e){
            LOGGER.error("errerur while sending file in message", e);
        }
    }


}
