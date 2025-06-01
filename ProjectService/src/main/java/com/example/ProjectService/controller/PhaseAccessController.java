package com.example.ProjectService.controller;

import com.example.ProjectService.dto.request.PhaseAccessRequest;
import com.example.ProjectService.dto.response.PhaseAccessResponse;
import com.example.ProjectService.services.PhaseAccessService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = {"https://e1.systeo.tn", "http://localhost:4200"},
        allowedHeaders = "*",
        allowCredentials = "true")
@RestController
@AllArgsConstructor
@RequestMapping("/phase-accesses")
public class PhaseAccessController {
    private PhaseAccessService phaseAccessService;
    @PostMapping
    public ResponseEntity<PhaseAccessResponse> createPhaseAccess(@RequestBody PhaseAccessRequest request) {
        PhaseAccessResponse response = phaseAccessService.createPhaseAccess(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhaseAccessResponse> getPhaseAccessById(@PathVariable String id) {
        PhaseAccessResponse response = phaseAccessService.getPhaseAccessById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<PhaseAccessResponse>> getAccessesByPhase(@PathVariable String phaseId) {
        List<PhaseAccessResponse> responses = phaseAccessService.getAccessesByPhase(phaseId);
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/view-permission")
    public ResponseEntity<PhaseAccessResponse> updateViewPermission(
            @PathVariable String id,
            @RequestParam boolean canView) {
        PhaseAccessResponse response = phaseAccessService.updateViewPermission(id, canView);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhaseAccess(@PathVariable String id) {
        phaseAccessService.deletePhaseAccess(id);
        return ResponseEntity.noContent().build();
    }
}
