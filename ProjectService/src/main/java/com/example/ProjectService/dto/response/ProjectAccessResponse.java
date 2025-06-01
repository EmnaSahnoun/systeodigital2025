package com.example.ProjectService.dto.response;

import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.models.enums.Role;
import lombok.Data;

import java.util.Date;


public class ProjectAccessResponse {
    private String id;
    private String idUser;
    private String emailUser;
    private InvitationStatus invitationStatus;
    private Role role;
    private String projectId;
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

    public String getIdUser() {
        return idUser;
    }

    public String getEmailUser() {
        return emailUser;
    }

    public InvitationStatus getInvitationStatus() {
        return invitationStatus;
    }

    public Role getRole() {
        return role;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }

    public void setEmailUser(String emailUser) {
        this.emailUser = emailUser;
    }

    public void setInvitationStatus(InvitationStatus invitationStatus) {
        this.invitationStatus = invitationStatus;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
