package com.example.ProjectService.exception;

public class TaskAccessNotFoundException extends Exception {
    private static final long serialVersionUID = 1L;
    public TaskAccessNotFoundException(String message) {
        super(message);
    }
}
