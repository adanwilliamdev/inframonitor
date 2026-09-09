package com.inframonitor.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuração de segurança temporária.
 *
 * O projeto trazia a dependência spring-boot-starter-security (e as libs JWT)
 * mas nenhuma classe de configuração — nesse cenário o Spring Security aplica
 * o padrão (basic auth com senha aleatória gerada no log), o que bloqueava
 * 100% das chamadas da API feitas pelo frontend.
 *
 * Esta configuração libera os endpoints para o app voltar a funcionar.
 * Antes de ir para produção, isso deve ser substituído por autenticação
 * real (ex.: JWT, já que as libs jjwt estão no pom.xml mas não são usadas).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll()
            )
            // necessário para o console do H2 renderizar (usa <frame>)
            .headers(headers -> headers
                .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)
            );

        return http.build();
    }
}
