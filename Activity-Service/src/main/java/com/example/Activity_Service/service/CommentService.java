package com.example.Activity_Service.service;

import com.example.Activity_Service.Exceptions.CommentCreationException;
import com.example.Activity_Service.Exceptions.CommentDeletionException;
import com.example.Activity_Service.Exceptions.CommentNotFoundException;
import com.example.Activity_Service.Exceptions.CommentUpdateException;
import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.NotificationDto;
import com.example.Activity_Service.dto.response.CommentResponse;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import com.example.Activity_Service.interfaces.IComment;
import com.example.Activity_Service.interfaces.ITask;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.publish.CommentNotificationProducer;
import com.example.Activity_Service.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService implements IComment {
    private final CommentRepository commentRepository;
    private final TaskHistoryService taskHistoryService;
    private final ITask taskService;
    private static final Logger logger = LoggerFactory.getLogger(CommentService.class);
    private final RabbitTemplate rabbitTemplate;
    @Value("${rabbitmq.exchange2.name}")
    private String exchangeName;
    @Value("${rabbitmq.routing.json.key2.name}")
    private String routingKey;
    @Autowired
    private CommentNotificationProducer notificationProducer;
    @Override
    public CommentResponse addComment(CommentRequest commentRequest) {
        try {
            // 1. Enregistrer le commentaire
            CommentResponse comment = commentRepository.save(commentRequest);

            TaskCommentNotificationDto notificationInfo;

            try {
                // 2. Récupérer les infos de notification depuis MSProject
                notificationInfo = taskService.getTaskNotificationbyIdTask(commentRequest.getTaskId());
                logger.info("=== Informations de la tâche récupérées ===");
                logger.info("ID Tâche: {}", commentRequest.getTaskId());
                logger.error("Bien reçu", notificationInfo.getTaskName());
                logger.info("Nom Tâche: {}", notificationInfo.getTaskName());
                logger.info("Nom Phase: {}", notificationInfo.getPhaseName());
                logger.info("Nom Projet: {}", notificationInfo.getProjectName());
                logger.info("Utilisateurs à notifier: {}", notificationInfo.getUserIdsToNotify());

                NotificationDto notification = new NotificationDto(

                        commentRequest.getTaskId(),
                        notificationInfo.getTaskName(),
                        notificationInfo.getProjectName(),
                        notificationInfo.getPhaseName(),
                        commentRequest.getUsername()+ " a ajouté un commentaire à la tâche" + notificationInfo.getTaskName()
                                +" (Phase ["+notificationInfo.getPhaseName() +"], Projet ["+ notificationInfo.getProjectName()+"])",
                        LocalDateTime.now(),
                        "commentaire",
                        notificationInfo.getUserIdsToNotify(),
                        commentRequest.getContent(),
                        commentRequest.getUsername(),

                        "CREATE"
                );
                logger.info("Sending notification to RabbitMQ: {}", notification);
                notificationProducer.sendNotification(notification);
            } catch (Exception e) {
                // Log l'erreur mais continue le traitement
                logger.error("Failed to fetch notification info from MSProject", e);
                notificationInfo = new TaskCommentNotificationDto(); // Objet vide
                notificationInfo.setTaskName("Unknown Task");
            }

            // 3. Enregistrer dans l'historique
            TaskHistory history = new TaskHistory();
            history.setTaskId(commentRequest.getTaskId());
            history.setIdUser(commentRequest.getIdUser());
            history.setUsername(commentRequest.getUsername());
            history.setAction("COMMENT");
            history.setFieldChanged("comments");
            history.setHistoryType("commentaire");

            taskHistoryService.recordHistory(history);

            return comment;
        } catch (Exception e) {
            logger.error("Failed to create comment", e);
            throw new CommentCreationException("Failed to create comment", e);
        }
    }

    @Override
    public List<CommentResponse> getCommentsForTask(String taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    @Override
    public void deleteComment(String commentId, String taskId, String idUser) {
        try {
            // Récupérer les informations de la tâche
            TaskCommentNotificationDto notificationInfo;
            try {
                notificationInfo = taskService.getTaskNotificationbyIdTask(taskId);
                logger.info("=== Informations de la tâche (DELETE) ===");
                logger.info("ID Tâche: {}", taskId);
                logger.info("Nom Tâche: {}", notificationInfo.getTaskName());
                logger.info("Nom Phase: {}", notificationInfo.getPhaseName());
                logger.info("Nom Projet: {}", notificationInfo.getProjectName());
            } catch (Exception e) {
                logger.error("Failed to fetch task info from MSProject", e);
                notificationInfo = new TaskCommentNotificationDto();
                notificationInfo.setTaskName("Unknown Task");
            }

            // Suppression du commentaire
            List<CommentResponse> comments = commentRepository.findByTaskId(taskId);
            comments.removeIf(c -> c.getId().equals(commentId));

            // Sauvegarder la liste mise à jour
            Path taskFile = commentRepository.getStoragePath().resolve(taskId + ".task");
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(taskFile.toFile()))) {
                oos.writeObject(comments);
            } catch (IOException e) {
                logger.error("Failed to save comments after deletion", e);
                throw new RuntimeException("Failed to save comments after deletion", e);
            }

            // Enregistrer dans l'historique
            taskHistoryService.recordCommentHistory(taskId, idUser, "DELETE",
                    "Comment deleted from task: " + notificationInfo.getTaskName(),"commentaire");

        } catch (Exception e) {
            logger.error("Failed to delete comment", e);
            throw new CommentDeletionException("Failed to delete comment", e);
        }
    }
    @Override
    public CommentResponse updateComment(String commentId, CommentRequest commentRequest) {
        try {
            // Récupérer les informations de la tâche
            TaskCommentNotificationDto notificationInfo;
            try {
                notificationInfo = taskService.getTaskNotificationbyIdTask(commentRequest.getTaskId());
                logger.info("=== Informations de la tâche (UPDATE) ===");
                logger.info("ID Tâche: {}", commentRequest.getTaskId());
                logger.info("Nom Tâche: {}", notificationInfo.getTaskName());
                logger.info("Nom Phase: {}", notificationInfo.getPhaseName());
                logger.info("Nom Projet: {}", notificationInfo.getProjectName());
            } catch (Exception e) {
                logger.error("Failed to fetch task info from MSProject", e);
                notificationInfo = new TaskCommentNotificationDto();
                notificationInfo.setTaskName("Unknown Task");
            }

            // Mise à jour du commentaire
            List<CommentResponse> comments = commentRepository.findByTaskId(commentRequest.getTaskId());

            CommentResponse updatedComment = comments.stream()
                    .filter(c -> c.getId().equals(commentId))
                    .findFirst()
                    .orElseThrow(() -> {
                        logger.error("Comment not found with id: {}", commentId);
                        return new CommentNotFoundException("Comment not found with id: " + commentId);
                    });

            // Sauvegarder l'ancienne valeur pour l'historique
            String oldContent = updatedComment.getContent();

            // Mettre à jour le commentaire
            updatedComment.setContent(commentRequest.getContent());
            updatedComment.setCreatedAt(LocalDateTime.now());

            // Sauvegarder la liste mise à jour
            Path taskFile = commentRepository.getStoragePath().resolve(commentRequest.getTaskId() + ".task");
            try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(taskFile.toFile()))) {
                oos.writeObject(comments);
            } catch (IOException e) {
                logger.error("Failed to save comments after update", e);
                throw new RuntimeException("Failed to save comments after update", e);
            }

            // Enregistrer dans l'historique
            taskHistoryService.recordCommentHistory(
                    commentRequest.getTaskId(),
                    commentRequest.getIdUser(),
                    "UPDATE",
                    String.format("Task: %s | Content changed from: %.20s to: %.20s",
                            notificationInfo.getTaskName(),
                            oldContent,
                            commentRequest.getContent()),
                    "commentaire"
            );

            return updatedComment;
        } catch (Exception e) {
            logger.error("Failed to update comment", e);
            throw new CommentUpdateException("Failed to update comment", e);
        }
    }
}