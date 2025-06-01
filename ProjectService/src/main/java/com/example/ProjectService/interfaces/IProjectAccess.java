package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.ProjectAccessRequest;
import com.example.ProjectService.dto.response.ProjectAccessResponse;
import com.example.ProjectService.models.enums.InvitationStatus;

import java.util.List;

public interface IProjectAccess {
    ProjectAccessResponse createProjectAccess(ProjectAccessRequest request);
    ProjectAccessResponse getProjectAccessById(String id);
    List<ProjectAccessResponse> getAccessesByProject(String projectId);
    ProjectAccessResponse updateInvitationStatus(String id, InvitationStatus status,String authToken);
    void deleteProjectAccess(String id);
}
