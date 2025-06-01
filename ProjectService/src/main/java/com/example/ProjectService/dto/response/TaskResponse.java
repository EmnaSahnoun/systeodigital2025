package com.example.ProjectService.dto.response;

import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import lombok.Data;

import java.util.Date;
import java.util.List;


public class TaskResponse {
    private String id;
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;
    private TaskStatus status;
    private TaskPriority priority;
    private String phaseId;
    private String parentTaskId;
    private List<String> subTaskIds;
    private Date createdAt;

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

    public String getName() {
        return name;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public String getPhaseId() {
        return phaseId;
    }

    public String getParentTaskId() {
        return parentTaskId;
    }

    public List<String> getSubTaskIds() {
        return subTaskIds;
    }



    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }

    public void setPhaseId(String phaseId) {
        this.phaseId = phaseId;
    }

    public void setParentTaskId(String parentTaskId) {
        this.parentTaskId = parentTaskId;
    }

    public void setSubTaskIds(List<String> subTaskIds) {
        this.subTaskIds = subTaskIds;
    }


}
