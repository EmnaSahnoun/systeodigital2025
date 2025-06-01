package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskCommentNotificationDto;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;

import java.util.List;

public interface ITask {

    TaskResponse createTask(TaskRequest request);
    TaskResponse getTaskById(String id);
    List<TaskResponse> getTasksByPhase(String phaseId);
    TaskResponse updateTaskStatus(String id, TaskStatus status);
    TaskResponse updateTaskPriority(String id, TaskPriority priority);
    TaskResponse addSubTask(String parentId, TaskRequest request);
    void deleteTask(String id);
    TaskResponse updateTask(String id, TaskRequest request);
    TaskCommentNotificationDto getTaskNotificationbyIdTask(String idTask);
}
