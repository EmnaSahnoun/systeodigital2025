package com.example.ProjectService.controller;
import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;
import com.example.ProjectService.services.PhaseService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@AllArgsConstructor
@RequestMapping("/phase")
public class PhaseController {
    private  PhaseService phaseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PhaseResponse createPhase(@RequestBody @Valid PhaseRequest request) {
        return phaseService.createPhase(request);
    }

    @GetMapping("/{id}")
    public PhaseResponse getPhaseById(@PathVariable String id) {
        return phaseService.getPhaseById(id);
    }

    @GetMapping("/project/{projectId}")
    public List<PhaseResponse> getPhasesByProject(@PathVariable String projectId) {
        return phaseService.getPhasesByProject(projectId);
    }

    @PutMapping("/{id}")
    public PhaseResponse updatePhase(@PathVariable String id,
                                     @RequestBody @Valid PhaseRequest request) {
        return phaseService.updatePhase(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhase(@PathVariable String id) {
        phaseService.deletePhase(id);
    }
}
