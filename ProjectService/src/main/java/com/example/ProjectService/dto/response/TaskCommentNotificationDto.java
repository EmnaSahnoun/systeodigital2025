package com.example.ProjectService.dto.response;

import java.util.List;

public class TaskCommentNotificationDto {
    private String taskName;
    private String projectName;
    private String phaseName;
    private List<String> userIdsToNotify;

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public String getPhaseName() {
        return phaseName;
    }

    public void setPhaseName(String phaseName) {
        this.phaseName = phaseName;
    }

    public List<String> getUserIdsToNotify() {
        return userIdsToNotify;
    }

    public void setUserIdsToNotify(List<String> userIdsToNotify) {
        this.userIdsToNotify = userIdsToNotify;
    }
}
