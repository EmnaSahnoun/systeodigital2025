package com.example.Activity_Service.repository;

import com.example.Activity_Service.consumer.TaskSendConsumer;
import com.example.Activity_Service.model.TaskHistory;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class TaskHistoryRepository {
    private final Path storagePath;
    private final ObjectMapper objectMapper; // Injecté
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskSendConsumer.class);

    @Autowired
    public TaskHistoryRepository(@Value("${storage.location}") String storageLocation, ObjectMapper objectMapper) {
        this.storagePath = Paths.get(storageLocation).resolve("history");
        this.objectMapper = objectMapper;
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create history directory", e);
        }
    }

    public TaskHistory save(TaskHistory history) {
        String id = UUID.randomUUID().toString();
        history.setId(id);
        history.setCreatedAt(LocalDateTime.now());

        Path historyFile = storagePath.resolve(history.getTaskId() + ".hist.json");

        try {
            // Crée le dossier parent si nécessaire
            Files.createDirectories(historyFile.getParent());

            // Si le fichier existe, lit son contenu
            List<TaskHistory> histories = new ArrayList<>();
            if (Files.exists(historyFile)) {
                try {
                    histories = objectMapper.readValue(
                            historyFile.toFile(),
                            new TypeReference<List<TaskHistory>>() {}
                    );
                } catch (IOException e) {
                    LOGGER.warn("Could not read history file, starting fresh", e);
                }
            }

            // Ajoute le nouvel historique
            histories.add(history);

            // Écrit le fichier avec indentation pour meilleure lisibilité
            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(historyFile.toFile(), histories);

            return history;
        } catch (IOException e) {
            LOGGER.error("Failed to save task history for task {}", history.getTaskId(), e);
            throw new RuntimeException("Failed to save task history", e);
        }
    }

    public List<TaskHistory> findByTaskId(String taskId) {
        Path historyFile = storagePath.resolve(taskId + ".hist.json");

        if (!Files.exists(historyFile)) {
            return new ArrayList<>();
        }

        try {
            // Désérialisation JSON avec Jackson
            List<TaskHistory> histories = objectMapper.readValue(
                    historyFile.toFile(),
                    new TypeReference<List<TaskHistory>>() {}
            );

            // Tri par date décroissante
            return histories.stream()
                    .sorted((h1, h2) -> h2.getCreatedAt().compareTo(h1.getCreatedAt()))
                    .collect(Collectors.toList());

        } catch (IOException e) {
            // En cas d'erreur (fichier corrompu ou vide), retourner une liste vide
            return new ArrayList<>();
        }
    }
}
