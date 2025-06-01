package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.PhaseAccessRequest;
import com.example.ProjectService.dto.response.PhaseAccessResponse;
import com.example.ProjectService.interfaces.IPhaseAccess;
import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.PhaseAccess;
import com.example.ProjectService.repositories.PhaseAccessRepository;
import com.example.ProjectService.repositories.PhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class PhaseAccessService implements IPhaseAccess {
    private final PhaseRepository phaseRepository;
    private final PhaseAccessRepository phaseAccessRepository;
    @Autowired
    public PhaseAccessService(PhaseRepository phaseRepository,
                              PhaseAccessRepository phaseAccessRepository) {
        this.phaseRepository = phaseRepository;
        this.phaseAccessRepository = phaseAccessRepository;
    }
    @Override
    public PhaseAccessResponse createPhaseAccess(PhaseAccessRequest request) {
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        PhaseAccess phaseAccess = new PhaseAccess();
        phaseAccess.setIdUser(request.getIdUser());
        phaseAccess.setCanView(request.getCanView());
        phaseAccess.setPhase(phase);

        PhaseAccess savedAccess = phaseAccessRepository.save(phaseAccess);
        return mapToPhaseAccessResponse(savedAccess);
    }

    @Override
    public PhaseAccessResponse getPhaseAccessById(String id) {
        PhaseAccess phaseAccess = phaseAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase access not found with id: " + id));
        return mapToPhaseAccessResponse(phaseAccess);
    }

    @Override
    public List<PhaseAccessResponse> getAccessesByPhase(String phaseId) {
        return phaseAccessRepository.findByPhaseId(phaseId)
                .stream()
                .map(this::mapToPhaseAccessResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhaseAccessResponse updateViewPermission(String id, boolean canView) {
        PhaseAccess phaseAccess = phaseAccessRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Phase access not found with id: " + id));

        phaseAccess.setCanView(canView);
        PhaseAccess updatedAccess = phaseAccessRepository.save(phaseAccess);
        return mapToPhaseAccessResponse(updatedAccess);
    }

    @Override
    public void deletePhaseAccess(String id) {
        if (!phaseAccessRepository.existsById(id)) {
            throw new RuntimeException("Phase access not found with id: " + id);
        }
        phaseAccessRepository.deleteById(id);

    }

    private PhaseAccessResponse mapToPhaseAccessResponse(PhaseAccess phaseAccess) {
        PhaseAccessResponse response = new PhaseAccessResponse();
        response.setId(phaseAccess.getId());
        response.setIdUser(phaseAccess.getIdUser());
        response.setCanView(phaseAccess.isCanView());

        if (phaseAccess.getPhase() != null) {
            response.setPhaseId(phaseAccess.getPhase().getId());
        }

        return response;
    }
}
