package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.ProjectRequest;
import com.example.ProjectService.dto.response.ProjectResponse;
import com.example.ProjectService.interfaces.IProject;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.Project;
import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.repositories.PhaseRepository;
import com.example.ProjectService.repositories.ProjectRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService implements IProject {
    private  final ProjectRepository projectRepository;
    private final PhaseRepository phaseRepository;
    @Autowired // Optionnel depuis Spring 4.3+
    public ProjectService(ProjectRepository projectRepository, PhaseRepository phaseRepository) {
        this.phaseRepository=phaseRepository;
        this.projectRepository = projectRepository;
    }
    @Override
    public ProjectResponse createProject(ProjectRequest request) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIdCompany(request.getIdCompany());
        project.setIdAdmin(request.getIdAdmin());
        project.setDeleted(false);
        project.setAddress(request.getAddress());
        project.setCompanyName(request.getCompanyName());
        Project savedProject = projectRepository.save(project);
        return mapToProjectResponse(savedProject);
    }

    @Override
    public ProjectResponse getProjectById(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        if (project.isDeleted()) {
            throw new RuntimeException("Project is deleted");
        }

        return mapToProjectResponse(project);
    }

    @Override
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAllByIsDeletedFalse()
                .stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProjectResponse updateProject(String id, ProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        if (project.isDeleted()) {
            throw new RuntimeException("Cannot update a deleted project");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setIdAdmin(request.getIdAdmin());
        project.setCreatedAt(project.getCreatedAt());
        project.setDeleted(request.isDeleted());
        project.setAddress(request.getAddress());
        Project updatedProject = projectRepository.save(project);
        return mapToProjectResponse(updatedProject);
    }

    @Override
    public void deleteProject(String id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setDeleted(true);
        projectRepository.save(project);
    }

    @Override
    public List<ProjectResponse> getProjectsByAdmin(String adminId) {
        return projectRepository.findByIdAdminAndIsDeletedFalse(adminId)
                .stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProjectResponse> getProjectsByCompany(String idCompany) {
        return projectRepository.findByIdCompanyAndIsDeletedFalse(idCompany)
                .stream()
                .map(this::mapToProjectResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToProjectResponse(Project project) {
        ProjectResponse response = new ProjectResponse();
        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setIdAdmin(project.getIdAdmin());
        response.setIdCompany(project.getIdCompany()); // Ajouté
        response.setDeleted(project.isDeleted());
        response.setCreatedAt(project.getCreatedAt());
        response.setAddress(project.getAddress());
        response.setCompanyName(project.getCompanyName());
        // Map project accesses IDs
        if (project.getProjectAccesses() != null) {
            response.setProjectAccessIds(project.getProjectAccesses()
                    .stream()
                    .map(ProjectAccess::getId)
                    .collect(Collectors.toList()));
        }

        // Map phase IDs
        if (project.getPhases() != null && !project.getPhases().isEmpty()) {
            response.setPhaseIds(project.getPhases()
                    .stream()
                    .map(Phase::getId)
                    .collect(Collectors.toList()));
        } else {
            // Si null, vérifier en base de données
            List<Phase> phases = phaseRepository.findByProjectId(project.getId());
            response.setPhaseIds(phases.stream()
                    .map(Phase::getId)
                    .collect(Collectors.toList()));
        }


        return response;
    }
    }
