package com.example.ProjectService.controller;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskCommentNotificationDto;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import com.example.ProjectService.services.TaskService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@AllArgsConstructor
@RequestMapping("/task")
public class TaskController {
    private  TaskService taskService;
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable String id) {
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<TaskResponse>> getTasksByPhase(@PathVariable String phaseId) {
        List<TaskResponse> responses = taskService.getTasksByPhase(phaseId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable String id,
            @RequestParam TaskStatus status) {
        TaskResponse response = taskService.updateTaskStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<TaskResponse> updateTaskPriority(
            @PathVariable String id,
            @RequestParam TaskPriority priority) {
        TaskResponse response = taskService.updateTaskPriority(id, priority);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{parentId}/subtasks")
    public ResponseEntity<TaskResponse> addSubTask(
            @PathVariable String parentId,
            @RequestBody TaskRequest request) {
        TaskResponse response = taskService.addSubTask(parentId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable String id,
            @RequestBody TaskRequest request) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/comment/{idTask}") // Changé de /compain/
    public ResponseEntity<TaskCommentNotificationDto> getTaskNotificationbyIdTask(@PathVariable String idTask) {
        TaskCommentNotificationDto responses = taskService.getTaskNotificationbyIdTask(idTask);
        return ResponseEntity.ok(responses);
    }
}
