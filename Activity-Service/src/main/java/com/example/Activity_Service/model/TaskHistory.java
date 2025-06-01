package com.example.Activity_Service.model;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TaskHistory implements Serializable {
    private String id;
    private String taskId;
    private String subTaskId;
    private String idUser;
    private String username;
    private String action; // "UPDATE_FIELD", "CREATE", "DELETE"
    private String fieldChanged; // "description", "status", etc.
    private String oldValue;
    private String newValue;
    private LocalDateTime createdAt;
    private String fileName;
    private String historyType;

    public String getHistoryType() {
        return historyType;
    }

    public void setHistoryType(String historyType) {
        this.historyType = historyType;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    private static final long serialVersionUID = 1L;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSubTaskId() {
        return subTaskId;
    }

    public void setSubTaskId(String subTaskId) {
        this.subTaskId = subTaskId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getIdUser() {
        return idUser;
    }

    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getFieldChanged() {
        return fieldChanged;
    }

    public void setFieldChanged(String fieldChanged) {
        this.fieldChanged = fieldChanged;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
