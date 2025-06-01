package com.example.ProjectService.interfaces;

import com.example.ProjectService.dto.request.PhaseAccessRequest;
import com.example.ProjectService.dto.response.PhaseAccessResponse;


import java.util.List;

public interface IPhaseAccess {
    PhaseAccessResponse createPhaseAccess(PhaseAccessRequest request);
    PhaseAccessResponse getPhaseAccessById(String id);
    List<PhaseAccessResponse> getAccessesByPhase(String phaseId);
    PhaseAccessResponse updateViewPermission(String id, boolean canView);
    void deletePhaseAccess(String id);
}
