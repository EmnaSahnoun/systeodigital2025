package com.example.ProjectService.repositories;


import com.example.ProjectService.models.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByPhaseId(String phaseId);
    List<Task> findAllBySubTasksContaining(Task task);
    Optional<Task> findById(String id);
}
