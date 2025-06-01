package com.example.DocumentService.repositories;

import com.example.DocumentService.model.MediaFile;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaFileRepository extends MongoRepository<MediaFile, String> {
    List<MediaFile> findByTaskId(String taskId);
    List<MediaFile> findByProjectId(String projectId);
    List<MediaFile> findByPhaseId(String phaseId);
}
