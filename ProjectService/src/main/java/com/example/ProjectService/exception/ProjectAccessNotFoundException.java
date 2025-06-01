package com.example.ProjectService.exception;

public class ProjectAccessNotFoundException extends Exception {
    private static final long serialVersionUID = 1L;
    public ProjectAccessNotFoundException(String message) {
        super(message);
    }
}
