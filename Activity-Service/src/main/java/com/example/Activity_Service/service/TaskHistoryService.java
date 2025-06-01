package com.example.Activity_Service.service;

import com.example.Activity_Service.interfaces.ITaskHistory;
import com.example.Activity_Service.model.TaskHistory;
import com.example.Activity_Service.repository.TaskHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class TaskHistoryService implements ITaskHistory {
    private final TaskHistoryRepository taskHistoryRepository;
    @Autowired
    public TaskHistoryService(TaskHistoryRepository taskHistoryRepository) {
        this.taskHistoryRepository = taskHistoryRepository;
    }
    @Override
    public TaskHistory recordHistory(TaskHistory history) {
        return taskHistoryRepository.save(history);
    }

    @Override
    public List<TaskHistory> getHistoryForTask(String taskId) {
        return taskHistoryRepository.findByTaskId(taskId);
    }
    @Override
    public TaskHistory recordCommentHistory(String taskId, String idUser, String action, String content,String historyType) {
        TaskHistory history = new TaskHistory();
        history.setTaskId(taskId);
        history.setIdUser(idUser);
        history.setAction(action);
        history.setFieldChanged("comments");
        history.setHistoryType(historyType);
        return this.recordHistory(history);
    }

    private String truncateComment(String content) {
        return content.length() > 50
                ? content.substring(0, 47) + "..."
                : content;
    }

}
