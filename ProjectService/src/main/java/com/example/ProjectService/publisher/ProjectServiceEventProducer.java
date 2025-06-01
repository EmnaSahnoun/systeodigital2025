package com.example.ProjectService.publisher;

import com.example.ProjectService.dto.response.NotificationDto;
import com.example.ProjectService.dto.response.TaskCommentNotificationDto;
import com.example.ProjectService.dto.response.TaskEventDTO;
import com.example.ProjectService.models.Task;
import com.example.ProjectService.services.TaskService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.amqp.core.*;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@Service

public class ProjectServiceEventProducer {
    @Value("${rabbitmq.exchange.name}")
    private String exchange;
    @Value("${rabbitmq.routing.json.key.name}")
    private String routingKeyJson;

    @Value("${rabbitmq.exchange3.name}")
    private String exchange3;
    @Value("${rabbitmq.routing.json.key3.name}")
    private String routingKeyJson3;
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private  ObjectMapper objectMapper;

    private final TaskService taskService;
    private static  final Logger LOGGER= LoggerFactory.getLogger(ProjectServiceEventProducer.class);



    public ProjectServiceEventProducer(RabbitTemplate rabbitTemplate, @Lazy TaskService taskService) {
        this.rabbitTemplate = rabbitTemplate;
        this.taskService = taskService;
    }

    public void sendTaskinMessage(Task task) {
try{
    TaskEventDTO message = new TaskEventDTO();
    message.setTaskId(task.getId());
    message.setUserId(task.getPhase().getProject().getIdAdmin());
    message.setAction(task.getAction());
    message.setCreatedAt(task.getCreatedAt());
    message.setParentTaskId(task.getParentTaskId());
    message.setChanges(task.getChanges());
        String jsonMessage = objectMapper.writeValueAsString(message);
        LOGGER.info(String.format("Json message sent -> %s", jsonMessage));
    TaskCommentNotificationDto notificationInfo = taskService.getTaskNotificationbyIdTask(task.getId());
    NotificationDto notification = new NotificationDto(

            task.getId(),
            task.getName(),
            task.getPhase().getProject().getName(),
            task.getPhase().getName(),
              task.getName()
                    +" (Phase ["+task.getPhase().getName() +"], Projet ["+ task.getPhase().getProject().getName()+"])",
            LocalDateTime.now(),
            "tache",
            notificationInfo.getUserIdsToNotify(),
            null,
            null,

            task.getAction()
    );
    LOGGER.info(String.format("Json notification sent -> %s", notification));
    rabbitTemplate.convertAndSend(exchange3, routingKeyJson3, notification);
        rabbitTemplate.convertAndSend(exchange, routingKeyJson, jsonMessage);

    }
    catch(Exception e){
        LOGGER.error("errerur while sending taskin message", e);
}
    }
}
