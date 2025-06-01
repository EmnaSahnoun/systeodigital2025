package com.example.Activity_Service.Exceptions;

public class CommentDeletionException extends RuntimeException {
    public CommentDeletionException(String message, Throwable cause) {
        super(message, cause);
    }
}
