package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;

import java.util.List;


public class ProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;

    private String description;

    @NotNull(message = "Admin ID is required")
    private String idAdmin;

    @NotNull(message = "Company ID is required")
    private String idCompany;

    @NotNull(message = "companyName is required")
    private String companyName;

    private boolean isDeleted;

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

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    public String getIdCompany() {
        return idCompany;
    }

    public void setIdCompany(String idCompany) {
        this.idCompany = idCompany;
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

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setIdAdmin(String idAdmin) {
        this.idAdmin = idAdmin;
    }
}