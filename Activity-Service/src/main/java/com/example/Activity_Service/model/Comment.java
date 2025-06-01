package com.example.Activity_Service.model;

import lombok.Data;

import java.time.LocalDateTime;
@Data
public class Comment {
    private String id;
    private String taskId;
    private String idUser;
    private String username;
    private String content;
    private LocalDateTime createdAt;

}
