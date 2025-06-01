package tn.iit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import tn.iit.config.JwtAuthConverter;

import java.util.Arrays;
@EnableMethodSecurity(prePostEnabled = true)
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;

    public SecurityConfig(JwtAuthConverter jwtAuthConverter) {
        this.jwtAuthConverter = jwtAuthConverter;
    }

    @Bean
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        return http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(
                "/actuator/**",
                "/h2-console/**",
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/webjars/**",
                "/swagger-resources/**",
                "/swagger-ui.html/**",
                "/swagger-ui/index.html",
                "/api-docs/**"
                ).permitAll()
                .anyExchange().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .jwkSetUri("https://esmm.systeo.tn/realms/systeodigital/protocol/openid-connect/certs")
                    .jwtAuthenticationConverter(new ReactiveJwtAuthenticationConverterAdapter(jwtAuthConverter))
                )

            )



            .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        //configuration.setAllowedOrigins(Arrays.asList("*"));
configuration.setAllowedOriginPatterns(Arrays.asList(
        "https://e1.systeo.tn",
        "http://localhost:4200"
    ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("X-Get-Header","Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
