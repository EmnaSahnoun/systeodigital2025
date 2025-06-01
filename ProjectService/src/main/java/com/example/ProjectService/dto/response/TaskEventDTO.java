package com.example.ProjectService.dto.response;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class TaskEventDTO {
    private String taskId;
    private String userId;
    private String action;
    private Date createdAt;
    private String parentTaskId;
    private List<TaskChangeEvent> changes;

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getParentTaskId() {
        return parentTaskId;
    }

    public void setParentTaskId(String parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public List<TaskChangeEvent> getChanges() {
        return changes;
    }

    public void setChanges(List<TaskChangeEvent> changes) {
        this.changes = changes;
    }
}
