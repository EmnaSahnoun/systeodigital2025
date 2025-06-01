package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.TaskRequest;
import com.example.ProjectService.dto.response.TaskChangeEvent;
import com.example.ProjectService.dto.response.TaskCommentNotificationDto;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.ProjectNotFoundException;
import com.example.ProjectService.exception.TaskNotFoundException;
import com.example.ProjectService.interfaces.ITask;
import com.example.ProjectService.models.*;
import com.example.ProjectService.models.enums.TaskPriority;
import com.example.ProjectService.models.enums.TaskStatus;
import com.example.ProjectService.publisher.ProjectServiceEventProducer;
import com.example.ProjectService.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Consumer;
import java.util.stream.Collectors;



@Service

public class TaskService implements ITask {
    private static final Logger LOGGER = LoggerFactory.getLogger(TaskService.class);
    private  final TaskRepository taskRepository;
    private  final PhaseRepository phaseRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final ProjectServiceEventProducer eventProducer;
    private final ProjectRepository projectRepository;
    private final PhaseAccessRepository phaseAccessRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository,
                       PhaseRepository phaseRepository,
                       ProjectAccessRepository projectAccessRepository,
                       ProjectServiceEventProducer eventProducer, ProjectRepository projectRepository, PhaseAccessRepository phaseAccessRepository) {
        this.taskRepository = taskRepository;
        this.phaseRepository = phaseRepository;
        this.projectAccessRepository = projectAccessRepository;
        this.eventProducer = eventProducer;
        this.projectRepository = projectRepository;
        this.phaseAccessRepository = phaseAccessRepository;
    }
    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest request) {
        // Récupérer la phase
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new PhaseNotFoundException(request.getPhaseId()));
        Project project=projectRepository.findById(phase.getProject().getId())
                .orElseThrow(() -> new ProjectNotFoundException(phase.getProject().getId()));
        // Créer la tâche
        Task task = new Task();
        task.setName(request.getName());
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setPhase(phase);


        // Sauvegarder la tâche
        Task savedTask = taskRepository.save(task);



        return mapToTaskResponse(savedTask);
    }


    @Override
    public TaskResponse getTaskById(String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        return mapToTaskResponse(task);

    }

    @Override
    public List<TaskResponse> getTasksByPhase(String phaseId) {
        return taskRepository.findByPhaseId(phaseId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskResponse updateTaskStatus(String id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse updateTaskPriority(String id, TaskPriority priority) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));

        task.setPriority(priority);
        Task updatedTask = taskRepository.save(task);
        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskResponse addSubTask(String parentId, TaskRequest request) {
        // Vérifier que la tâche parent existe
        Task parentTask = taskRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent task not found with id: " + parentId));

        // Vérifier que la phase existe
        Phase phase = phaseRepository.findById(request.getPhaseId())
                .orElseThrow(() -> new RuntimeException("Phase not found with id: " + request.getPhaseId()));

        // Créer la sous-tâche
        Task subTask = new Task();
        subTask.setName(request.getName());
        subTask.setDescription(request.getDescription());
        subTask.setStartDate(request.getStartDate());
        subTask.setEndDate(request.getEndDate());
        subTask.setStatus(request.getStatus());
        subTask.setPriority(request.getPriority());
        subTask.setPhase(phase);
        subTask.setParentTaskId(parentId); // Définir l'ID du parent
        subTask.setAction("CREATE");
        // Sauvegarder la sous-tâche
        Task savedSubTask = taskRepository.save(subTask);

        // Ajouter la sous-tâche à la liste des sous-tâches du parent
        if (parentTask.getSubTasks() == null) {
            parentTask.setSubTasks(new ArrayList<>());
        }
        parentTask.getSubTasks().add(savedSubTask);
        eventProducer.sendTaskinMessage(savedSubTask);
        taskRepository.save(parentTask);

        // Créer la réponse
        TaskResponse response = mapToTaskResponse(savedSubTask);
        response.setParentTaskId(parentId); // S'assurer que l'ID parent est dans la réponse

        return response;
    }
    @Override
    public void deleteTask(String id) {

        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("task non trouvé!");
        }
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        Phase phase = phaseRepository.findById(task.getPhase().getId())
                .orElseThrow(() -> new PhaseNotFoundException(task.getPhase().getId()));
        Project project=projectRepository.findById(phase.getProject().getId())
                .orElseThrow(() -> new ProjectNotFoundException(phase.getProject().getId()));
        taskRepository.deleteById(id);
        task.setAction("DELETE");
        eventProducer.sendTaskinMessage(task);
    }

    @Override
    public TaskResponse updateTask(String id, TaskRequest request) {
        // 1. Récupération de la tâche existante
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + id));

        // 2. Préparation de la liste des changements
        List<TaskChangeEvent> changes = new ArrayList<>();

        // 3. Vérification et mise à jour de chaque champ
        updateFieldIfChanged(task, request.getName(), task.getName(), "name", changes,
                newValue -> task.setName(newValue));

        updateFieldIfChanged(task, request.getDescription(), task.getDescription(), "description", changes,
                newValue -> task.setDescription(newValue));

        updateFieldIfChanged(task, request.getStatus(), task.getStatus(), "status", changes,
                newValue -> task.setStatus(newValue));

        updateFieldIfChanged(task, request.getPriority(), task.getPriority(), "priority", changes,
                newValue -> task.setPriority(newValue));

        updateFieldIfChanged(task, request.getStartDate(), task.getStartDate(), "startDate", changes,
                newValue -> task.setStartDate(newValue));

        updateFieldIfChanged(task, request.getEndDate(), task.getEndDate(), "endDate", changes,
                newValue -> task.setEndDate(newValue));

        // 4. Gestion du parentTaskId
        if (!Objects.equals(task.getParentTaskId(), request.getParentTaskId())) {
            task.setParentTaskId(request.getParentTaskId());
        }

        // 5. Gestion du changement de phase
        if (!task.getPhase().getId().equals(request.getPhaseId())) {
            Phase newPhase = phaseRepository.findById(request.getPhaseId())
                    .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + request.getPhaseId()));
            changes.add(new TaskChangeEvent(
                    "phase",
                    task.getPhase().getId(),
                    newPhase.getId(),
                    LocalDateTime.now()
            ));
            task.setPhase(newPhase);
        }

        // 6. Sauvegarde et envoi de l'événement
        Task updatedTask = taskRepository.save(task);
        updatedTask.setAction("UPDATE");

        if (!changes.isEmpty()) {
            updatedTask.setChanges(changes);
            eventProducer.sendTaskinMessage(updatedTask);
        }

        return mapToTaskResponse(updatedTask);
    }

    @Override
    public TaskCommentNotificationDto getTaskNotificationbyIdTask(String idTask) {
        Task task = taskRepository.findById(idTask)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + idTask));

        TaskCommentNotificationDto dto = new TaskCommentNotificationDto();
        dto.setTaskName(task.getName());

        if (task.getPhase() != null) {
            Phase phase = task.getPhase();
            dto.setPhaseName(phase.getName());

            Project project = phase.getProject();

            dto.setProjectName(project.getName());

            List<PhaseAccess> phaseAccesses = phaseAccessRepository.findByPhaseAndCanView(phase, true);
            List<String> userIds = phaseAccesses.stream()
                    .map(PhaseAccess::getIdUser)
                    .distinct()
                    .collect(Collectors.toList());
            dto.setUserIdsToNotify(userIds);
        }

        return dto;
    }
    // Méthode utilitaire pour factoriser le code de mise à jour
    private <T> void updateFieldIfChanged(Task task, T newValue, T currentValue, String fieldName,
                                          List<TaskChangeEvent> changes, Consumer<T> setter) {
        if (!Objects.equals(newValue, currentValue)) {
            changes.add(new TaskChangeEvent(
                    fieldName,
                    currentValue != null ? currentValue.toString() : null,
                    newValue != null ? newValue.toString() : null,
                    LocalDateTime.now()
            ));
            setter.accept(newValue);
        }
    }
    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setName(task.getName());
        response.setDescription(task.getDescription());
        response.setStartDate(task.getStartDate());
        response.setEndDate(task.getEndDate());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        response.setParentTaskId(task.getParentTaskId());

        if (task.getPhase() != null) {
            response.setPhaseId(task.getPhase().getId());
        }

        if (task.getSubTasks() != null) {
            response.setSubTaskIds(task.getSubTasks()
                    .stream()
                    .map(Task::getId)
                    .collect(Collectors.toList()));
        } else {
            response.setSubTaskIds(Collections.emptyList());
        }



        return response;
    }
}
