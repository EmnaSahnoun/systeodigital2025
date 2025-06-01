package com.example.Activity_Service.interfaces;

import com.example.Activity_Service.dto.request.CommentRequest;
import com.example.Activity_Service.dto.response.CommentResponse;
import com.example.Activity_Service.dto.response.CommentResponse;

import java.util.List;

public interface IComment {
    CommentResponse addComment(CommentRequest commentRequest);
    List<CommentResponse> getCommentsForTask(String taskId);
    void deleteComment(String commentId, String taskId, String idUser);
    CommentResponse updateComment(String commentId, CommentRequest commentRequest);
}
