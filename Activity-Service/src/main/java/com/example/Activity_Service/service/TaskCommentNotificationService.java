package com.example.Activity_Service.service;

import com.example.Activity_Service.clients.TaskCommentNotificationClient;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import com.example.Activity_Service.interfaces.ITask;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskCommentNotificationService implements ITask {
    private final TaskCommentNotificationClient taskCommentNotificationClient;

    @Override
    public TaskCommentNotificationDto getTaskNotificationbyIdTask(String idTask) {
        return taskCommentNotificationClient.getTaskNotificationbyIdTask(idTask);    }

}
