package com.example.Activity_Service.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.ResponseEntityDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;
import feign.codec.Decoder;

import org.springframework.cloud.openfeign.support.SpringDecoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;


@Configuration
public class FeignConfig {
    @Bean
    public Decoder feignDecoder() {
        ObjectFactory<HttpMessageConverters> messageConverters = () -> new HttpMessageConverters(
                new MappingJackson2HttpMessageConverter(customObjectMapper())
        );
        return new ResponseEntityDecoder(new SpringDecoder(messageConverters));
    }

    @Bean
    public ObjectMapper customObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }

    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {
        return requestTemplate -> {
            // WebMvc
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String token = attributes.getRequest().getHeader("Authorization");
                if (token != null) {
                    requestTemplate.header("Authorization", token);
                }
            }

            // WebFlux
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication instanceof JwtAuthenticationToken) {
                String token = ((JwtAuthenticationToken) authentication).getToken().getTokenValue();
                requestTemplate.header("Authorization", "Bearer " + token);
            }
        };
    }
}
