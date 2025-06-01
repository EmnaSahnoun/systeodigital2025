package com.example.Activity_Service.interfaces;

import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;

import java.util.List;

public interface ITask {
    TaskCommentNotificationDto getTaskNotificationbyIdTask(String idTask);
}
