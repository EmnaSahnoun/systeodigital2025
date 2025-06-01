package com.example.ProjectService.dto.request;

import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;


public class TaskRequest {
    @NotBlank(message = "Task name is required")
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    @NotNull(message = "Priority is required")
    private TaskPriority priority;

    @NotNull(message = "Phase ID is required")
    private String phaseId;
    private String parentTaskId;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
