package com.example.ProjectService.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;

import java.util.Date;
import java.util.List;

@Document(collection = "projects")

public class Project {
    @Id
    private String id;
    private String idCompany;
    private String companyName;
    private String name;
    private String description;
    private String idAdmin;
    private boolean isDeleted = false;
    private Date createdAt = new Date();
    private String address;


    @DBRef
    private List<ProjectAccess> projectAccesses;

    @DBRef
    private List<Phase> phases;

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public String getIdCompany() {
        return idCompany;
    }

    public void setIdCompany(String idCompany) {
        this.idCompany = idCompany;
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

    public String getIdAdmin() {
        return idAdmin;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public List<ProjectAccess> getProjectAccesses() {
        return projectAccesses;
    }

    public List<Phase> getPhases() {
        return phases;
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

    public void setIdAdmin(String idAdmin) {
        this.idAdmin = idAdmin;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public void setProjectAccesses(List<ProjectAccess> projectAccesses) {
        this.projectAccesses = projectAccesses;
    }

    public void setPhases(List<Phase> phases) {
        this.phases = phases;
    }
}
