package com.example.ProjectService.models;


import com.example.ProjectService.dto.response.TaskChangeEvent;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;
    private TaskStatus status;
    private TaskPriority priority;
    private Date createdAt = new Date();
    @DBRef
    private List<Task> subTasks = new ArrayList<>();;

    private String parentTaskId;
    @Transient
    private String action;
    @Transient
    private List<TaskChangeEvent> changes;

    @DBRef
    private Phase phase;

    public List<TaskChangeEvent> getChanges() {
        return changes;
    }

    public void setChanges(List<TaskChangeEvent> changes) {
        this.changes = changes;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getParentTaskId() {
        return parentTaskId;
    }

    public void setParentTaskId(String parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public List<Task> getSubTasks() {
        return subTasks;
    }

    public void setSubTasks(List<Task> subTasks) {
        this.subTasks = subTasks;
    }



    public Phase getPhase() {
        return phase;
    }

    public void setPhase(Phase phase) {
        this.phase = phase;
    }
}
