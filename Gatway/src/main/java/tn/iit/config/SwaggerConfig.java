package tn.iit.config;

import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springdoc.core.properties.SwaggerUiConfigProperties;

@Configuration
public class SwaggerConfig {

    @Bean
    @Primary  // Ajoutez cette annotation
    public SwaggerUiConfigProperties swaggerUiConfigProperties() {
        return new SwaggerUiConfigProperties();
    }

    @Bean
    public GroupedOpenApi gatewayApi() {
        return GroupedOpenApi.builder()
                .group("gateway")
                .pathsToMatch("/**")
                .build();
    }
}
