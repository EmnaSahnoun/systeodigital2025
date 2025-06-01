package com.example.Activity_Service.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;
@Configuration
public class FileStorageConfig {
    @Value("${storage.location}")
    private String storageLocation;

    @Bean
    public Path fileStorageLocation() {
        Path path = Paths.get(storageLocation).toAbsolutePath().normalize();
        path.toFile().mkdirs();
        return path;
    }
}
