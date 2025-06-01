package com.example.ProjectService.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Document(collection = "phases")
public class Phase {
    @Id
    private String id;
    private String name;
    private String description;
    private Date startDate;
    private Date endDate;
    private Date createdAt = new Date();




    @DBRef
    private Project project;


    @DBRef
    private List<Task> tasks = new ArrayList<>();

    @DBRef
    private List<PhaseAccess> phaseAccesses = new ArrayList<>();


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

    public List<Task> getTasks() {
        return tasks;
    }

    public Project getProject() {
        return project;
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

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public List<PhaseAccess> getPhaseAccesses() {
        return phaseAccesses;
    }

    public void setPhaseAccesses(List<PhaseAccess> phaseAccesses) {
        this.phaseAccesses = phaseAccesses;
    }
}
