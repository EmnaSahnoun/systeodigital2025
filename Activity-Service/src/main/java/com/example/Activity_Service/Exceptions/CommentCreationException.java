package com.example.Activity_Service.Exceptions;

public class CommentCreationException extends RuntimeException {
    public CommentCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
