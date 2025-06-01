package com.example.ProjectService.dto.response;


import lombok.Data;
import com.example.ProjectService.dto.response.PhaseResponse;

import java.util.Date;
import java.util.List;


public class ProjectResponse {
    private String id;
    private String idCompany;
    private String companyName;
    private String name;
    private String description;
    private String idAdmin;
    private boolean isDeleted;
    private List<String> projectAccessIds;
    private List<String> phaseIds;
    private Date createdAt;
    private String address;

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

    public List<String> getProjectAccessIds() {
        return projectAccessIds;
    }

    public List<String> getPhaseIds() {
        return phaseIds;
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

    public void setProjectAccessIds(List<String> projectAccessIds) {
        this.projectAccessIds = projectAccessIds;
    }

    public void setPhaseIds(List<String> phaseIds) {
        this.phaseIds = phaseIds;
    }

    public String getIdCompany() {
        return idCompany;
    }

    public void setIdCompany(String idCompany) {
        this.idCompany = idCompany;
    }
}