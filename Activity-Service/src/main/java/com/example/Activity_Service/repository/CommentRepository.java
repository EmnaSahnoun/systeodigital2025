package com.example.Activity_Service.repository;

import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.CommentResponse;
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
public class CommentRepository {
    private final Path storagePath;
    public Path getStoragePath() {
        return storagePath;
    }
    public CommentRepository(@Value("${storage.location}") String storageLocation) {
        this.storagePath = Paths.get(storageLocation).resolve("comments");
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create comments directory", e);
        }
    }

    public CommentResponse save(CommentRequest commentRequest) {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();

        CommentResponse comment = new CommentResponse();
        comment.setId(id);
        comment.setTaskId(commentRequest.getTaskId());
        comment.setIdUser(commentRequest.getIdUser());
        comment.setContent(commentRequest.getContent());
        comment.setUsername(commentRequest.getUsername());
        comment.setCreatedAt(now);

        Path taskFile = storagePath.resolve(commentRequest.getTaskId() + ".task");

        // Lire les commentaires existants
        List<CommentResponse> comments = new ArrayList<>();
        if (Files.exists(taskFile)) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(taskFile.toFile()))) {
                comments = (List<CommentResponse>) ois.readObject();
            } catch (IOException | ClassNotFoundException e) {
                throw new RuntimeException("Failed to read existing comments", e);
            }
        }

        // Ajouter le nouveau commentaire
        comments.add(comment);

        // Sauvegarder la liste mise à jour
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(taskFile.toFile()))) {
            oos.writeObject(comments);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save comments", e);
        }

        return comment;
    }

    public List<CommentResponse> findByTaskId(String taskId) {
        Path taskFile = storagePath.resolve(taskId + ".task");

        if (!Files.exists(taskFile)) {
            return new ArrayList<>();
        }

        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(taskFile.toFile()))) {
            List<CommentResponse> comments = (List<CommentResponse>) ois.readObject();
            return comments.stream()
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .collect(Collectors.toList());
        } catch (IOException | ClassNotFoundException e) {
            throw new RuntimeException("Failed to read comments for task: " + taskId, e);
        }
    }
}
