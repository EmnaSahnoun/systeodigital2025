package com.example.ProjectService.repositories;

import com.example.ProjectService.models.Phase;
import com.example.ProjectService.models.PhaseAccess;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface PhaseAccessRepository extends MongoRepository<PhaseAccess, String> {
    List<PhaseAccess> findByPhaseId(String phaseId);
    boolean existsByPhaseIdAndIdUser(String phaseId, String userId);
    List<PhaseAccess> findByPhaseAndCanView(Phase phase, boolean canView);
}
