package com.example.ProjectService.repositories;


import com.example.ProjectService.models.ProjectAccess;
import com.example.ProjectService.models.enums.InvitationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface ProjectAccessRepository extends MongoRepository<ProjectAccess, String> {
    List<ProjectAccess> findByProjectId(String projectId);
    List<ProjectAccess> findByProjectIdAndInvitationStatus(String projectId, InvitationStatus status);
}
