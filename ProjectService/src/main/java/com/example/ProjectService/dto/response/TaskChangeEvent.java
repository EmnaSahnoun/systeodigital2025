package com.example.ProjectService.dto.response;

import java.time.LocalDateTime;

public class TaskChangeEvent {

    private String fieldChanged; // "name", "description", "status", etc.
    private String oldValue;
    private String newValue;

    private LocalDateTime changeTime = LocalDateTime.now();

    public TaskChangeEvent(String fieldChanged, String oldValue, String newValue, LocalDateTime changeTime) {
        this.fieldChanged = fieldChanged;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changeTime = changeTime;
    }

    public TaskChangeEvent() {
    }

    public String getFieldChanged() {
        return fieldChanged;
    }

    public void setFieldChanged(String fieldChanged) {
        this.fieldChanged = fieldChanged;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }



    public LocalDateTime getChangeTime() {
        return changeTime;
    }

    public void setChangeTime(LocalDateTime changeTime) {
        this.changeTime = changeTime;
    }
}
