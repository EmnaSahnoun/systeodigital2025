package com.example.ProjectService.services;

import com.example.ProjectService.dto.request.PhaseRequest;
import com.example.ProjectService.dto.response.PhaseResponse;
import com.example.ProjectService.dto.response.TaskResponse;
import com.example.ProjectService.exception.PhaseNotFoundException;
import com.example.ProjectService.exception.ProjectNotFoundException;
import com.example.ProjectService.interfaces.IPhase;
import com.example.ProjectService.models.*;

import com.example.ProjectService.models.enums.InvitationStatus;
import com.example.ProjectService.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service

public class PhaseService implements IPhase {
    private final PhaseRepository phaseRepository;
    private  final  ProjectRepository projectRepository;
    private final PhaseAccessRepository phaseAccessRepository;
    private final ProjectAccessRepository projectAccessRepository;
    private final TaskRepository taskRepository;
    @Autowired
    public PhaseService(PhaseRepository phaseRepository,
                        ProjectRepository projectRepository,
                        PhaseAccessRepository phaseAccessRepository,
                        ProjectAccessRepository projectAccessRepository,
                        TaskRepository taskRepository) {
        this.phaseRepository = phaseRepository;
        this.projectRepository = projectRepository;
        this.phaseAccessRepository = phaseAccessRepository;
        this.projectAccessRepository = projectAccessRepository;
        this.taskRepository = taskRepository;

    }

    @Override
    public PhaseResponse createPhase(PhaseRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + request.getProjectId()));

        Phase phase = new Phase();
        phase.setName(request.getName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());
        phase.setProject(project);

        // Initialiser les listes pour éviter les NullPointerException
        phase.setTasks(new ArrayList<>());
        phase.setPhaseAccesses(new ArrayList<>());

        Phase savedPhase = phaseRepository.save(phase);

        // Créer les PhaseAccess pour chaque membre accepté du projet
        createPhaseAccessesForProjectMembers(savedPhase, project);

        return mapToResponse(savedPhase);
    }

    private void createPhaseAccessesForProjectMembers(Phase phase, Project project) {
        // Récupérer tous les ProjectAccess ACCEPTED pour ce projet
        List<ProjectAccess> acceptedMembers = projectAccessRepository.findByProjectIdAndInvitationStatus(
                project.getId(),
                InvitationStatus.ACCEPTED
        );

        // Créer un PhaseAccess pour chaque membre
        for (ProjectAccess member : acceptedMembers) {
            PhaseAccess phaseAccess = new PhaseAccess();
            phaseAccess.setIdUser(member.getIdUser());
            phaseAccess.setCanView(true); // Par défaut, l'accès en lecture est autorisé
            phaseAccess.setPhase(phase);

            PhaseAccess savedAccess = phaseAccessRepository.save(phaseAccess);

            // Ajouter le PhaseAccess à la liste de la phase
            phase.getPhaseAccesses().add(savedAccess);
        }

        // Sauvegarder la phase avec les accès mis à jour
        phaseRepository.save(phase);
    }
    public void synchronizePhaseAccesses(String projectId) {
        // Récupérer tous les membres acceptés du projet
        List<ProjectAccess> acceptedMembers = projectAccessRepository.findByProjectIdAndInvitationStatus(
                projectId,
                InvitationStatus.ACCEPTED
        );

        // Récupérer toutes les phases du projet
        List<Phase> phases = phaseRepository.findByProjectId(projectId);

        for (Phase phase : phases) {
            for (ProjectAccess member : acceptedMembers) {
                // Vérifier si l'utilisateur a déjà un accès à cette phase
                boolean exists = phaseAccessRepository.existsByPhaseIdAndIdUser(
                        phase.getId(),
                        member.getIdUser()
                );

                if (!exists) {
                    PhaseAccess phaseAccess = new PhaseAccess();
                    phaseAccess.setIdUser(member.getIdUser());
                    phaseAccess.setCanView(false); // Accès false par défaut
                    phaseAccess.setPhase(phase);

                    phaseAccessRepository.save(phaseAccess);

                    // Ajouter à la liste des accès de la phase
                    phase.getPhaseAccesses().add(phaseAccess);
                }
            }
            phaseRepository.save(phase);
        }
    }
    private void createDefaultPhaseAccesses(Phase phase, List<ProjectAccess> projectMembers) {
        for (ProjectAccess member : projectMembers) {
            PhaseAccess phaseAccess = new PhaseAccess();
            phaseAccess.setIdUser(member.getIdUser());
            phaseAccess.setCanView(true);
            phaseAccess.setPhase(phase);
            phaseAccessRepository.save(phaseAccess);
        }
    }

    @Override
    public PhaseResponse getPhaseById(String id) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + id));
        return mapToResponse(phase);
    }

    @Override
    public List<PhaseResponse> getPhasesByProject(String projectId) {
        return phaseRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PhaseResponse updatePhase(String id, PhaseRequest request) {
        Phase phase = phaseRepository.findById(id)
                .orElseThrow(() -> new PhaseNotFoundException("Phase not found with id: " + id));

        phase.setName(request.getName());
        phase.setDescription(request.getDescription());
        phase.setStartDate(request.getStartDate());
        phase.setEndDate(request.getEndDate());

        // Update project reference if needed
        if (!phase.getProject().getId().equals(request.getProjectId())) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found with id: " + request.getProjectId()));
            phase.setProject(project);
        }

        Phase updatedPhase = phaseRepository.save(phase);
        return mapToResponse(updatedPhase);
    }

    @Override
    public void deletePhase(String id) {
        if (!phaseRepository.existsById(id)) {
            throw new PhaseNotFoundException("Phase not found with id: " + id);
        }
        phaseRepository.deleteById(id);
    }

    private PhaseResponse mapToResponse(Phase phase) {
        PhaseResponse response = new PhaseResponse();
        response.setId(phase.getId());
        response.setName(phase.getName());
        response.setDescription(phase.getDescription());
        response.setStartDate(phase.getStartDate());
        response.setEndDate(phase.getEndDate());
        response.setProjectId(phase.getProject().getId());
        response.setCreatedAt(phase.getCreatedAt());

        List<Task> tasks = phase.getTasks();
        if (tasks == null || tasks.isEmpty()) {
            tasks = taskRepository.findByPhaseId(phase.getId());
        }

        response.setTaskIds(tasks.stream()
                .map(Task::getId)
                .collect(Collectors.toList()));
        if (phase.getPhaseAccesses() != null) {
            response.setPhaseAccessIds(phase.getPhaseAccesses()
                    .stream()
                    .map(PhaseAccess::getId)
                    .collect(Collectors.toList()));
        }
        return response;
    }

}
