package com.example.ProjectService.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class PhaseNotFoundException extends RuntimeException {
    public PhaseNotFoundException(Long phaseId) {
        super("Phase not found with id: " + phaseId);
    }

    public PhaseNotFoundException(String message) {
        super(message);
    }
}