package com.example.Activity_Service.controller;

import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.CommentResponse;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import com.example.Activity_Service.service.CommentService;
import com.example.Activity_Service.service.TaskCommentNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")

public class CommentController {
    private final CommentService commentService;
    private final TaskCommentNotificationService taskCommentNotificationService;
    @Autowired
    public CommentController(CommentService commentService , TaskCommentNotificationService taskCommentNotificationService) {
        this.commentService = commentService;
        this.taskCommentNotificationService = taskCommentNotificationService;
    }
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(@RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.addComment(commentRequest));
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<CommentResponse>> getCommentsForTask(@PathVariable String taskId) {
        return ResponseEntity.ok(commentService.getCommentsForTask(taskId));
    }
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestParam String taskId,
            @RequestParam String idUser) {
        commentService.deleteComment(commentId, taskId, idUser);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable String commentId,
            @RequestBody CommentRequest commentRequest) {
        return ResponseEntity.ok(commentService.updateComment(commentId, commentRequest));
    }

    @GetMapping("/{idTask}/taskInfo")
    public ResponseEntity<TaskCommentNotificationDto> getTaskNotificationbyIdTask(@PathVariable String idTask) {
        TaskCommentNotificationDto taskCommentNotificationDto = taskCommentNotificationService.getTaskNotificationbyIdTask(idTask);
        return ResponseEntity.ok(taskCommentNotificationDto);
    }
}
