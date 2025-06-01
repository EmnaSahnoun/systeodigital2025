package com.example.Activity_Service.clients;

import com.example.Activity_Service.config.FeignConfig;
import com.example.Activity_Service.dto.response.TaskCommentNotificationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "PROJECTSERVICE",
        configuration = FeignConfig.class,
        url="https://e1.systeo.tn/ProjectService"

)
public interface TaskCommentNotificationClient {
    @GetMapping("/task/comment/{idTask}")
    TaskCommentNotificationDto getTaskNotificationbyIdTask(@PathVariable String idTask);
}

