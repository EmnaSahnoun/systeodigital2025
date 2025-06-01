package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;

import java.util.List;

public interface IPhase {
    PhaseResponse createPhase(PhaseRequest request);
    PhaseResponse getPhaseById(String id);
    List<PhaseResponse> getPhasesByProject(String projectId);
    PhaseResponse updatePhase(String id, PhaseRequest request);
    void deletePhase(String id);
}
