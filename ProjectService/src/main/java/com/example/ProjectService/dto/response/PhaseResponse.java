package com.example.ProjectService.dto.response;

import lombok.Data;

import java.util.Date;
import java.util.List;


public class PhaseResponse {
    private String id;
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;
    private String projectId;
    private List<String> taskIds;
    private List<String> phaseAccessIds;
    private Date createdAt;

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

    public String getDescription() {
        return description;
    }

    public Date getStartDate() {
        return startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public String getProjectId() {
        return projectId;
    }

    public List<String> getTaskIds() {
        return taskIds;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public void setTaskIds(List<String> taskIds) {
        this.taskIds = taskIds;
    }

    public List<String> getPhaseAccessIds() {
        return phaseAccessIds;
    }

    public void setPhaseAccessIds(List<String> phaseAccessIds) {
        this.phaseAccessIds = phaseAccessIds;
    }
}
