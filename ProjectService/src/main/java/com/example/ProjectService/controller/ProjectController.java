package com.example.ProjectService.controller;

import com.example.ProjectService.dto.request.ProjectRequest;
import com.example.ProjectService.dto.response.ProjectResponse;
import com.example.ProjectService.interfaces.IProject;
import com.example.ProjectService.services.ProjectService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@AllArgsConstructor
@RequestMapping("/project")
public class ProjectController {
    private  ProjectService projectService;


    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable String id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        List<ProjectResponse> responses = projectService.getAllProjects();
        return ResponseEntity.ok(responses);
    }
   
    @GetMapping("/company/{idCompany}") // Changé de /compain/
    public ResponseEntity<List<ProjectResponse>> getProjectsByCompany(@PathVariable String idCompany) {
        List<ProjectResponse> responses = projectService.getProjectsByCompany(idCompany);
        return ResponseEntity.ok(responses);
    }
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByAdmin(@PathVariable String adminId) {
        List<ProjectResponse> responses = projectService.getProjectsByAdmin(adminId);
        return ResponseEntity.ok(responses);
    }
}
