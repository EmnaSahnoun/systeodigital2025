package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.ProjectRequest;
import com.example.ProjectService.dto.response.ProjectResponse;

import java.util.List;

public interface IProject {
    ProjectResponse createProject(ProjectRequest request);
    ProjectResponse getProjectById(String id);
    List<ProjectResponse> getAllProjects();
    ProjectResponse updateProject(String id, ProjectRequest request);
    void deleteProject(String id);
    List<ProjectResponse> getProjectsByAdmin(String adminId);
    List<ProjectResponse> getProjectsByCompany(String idCompany);
}
