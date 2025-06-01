package com.example.ProjectService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


public class PhaseAccessRequest {
    @NotNull(message = "User ID is required")
    private String idUser;

    @NotNull(message = "Phase ID is required")
    private String phaseId;

    @NotNull(message = "View permission is required")
    private Boolean canView;

    public String getIdUser() {
        return idUser;
    }

    public void setIdUser(String idUser) {
        this.idUser = idUser;
    }

    public String getPhaseId() {
        return phaseId;
    }

    public void setPhaseId(String phaseId) {
        this.phaseId = phaseId;
    }

    public Boolean getCanView() {
        return canView;
    }

    public void setCanView(Boolean canView) {
        this.canView = canView;
    }
}
