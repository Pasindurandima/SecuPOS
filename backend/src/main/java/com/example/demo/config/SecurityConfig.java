package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.example.demo.security.JwtAuthenticationEntryPoint;
import com.example.demo.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAuthenticationFilter authenticationFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http))
                .authorizeHttpRequests(auth -> auth
                      .requestMatchers("/auth/**", "/public/**", "/adding-users/**", "/roles/initialize").permitAll()
                      .requestMatchers("/roles/**").hasAuthority("PERMISSION_ROLES")
                      .requestMatchers("/users/**").hasAuthority("PERMISSION_USERS")
                      .requestMatchers(HttpMethod.GET, "/products/**").hasAnyAuthority("PERMISSION_PRODUCTS", "PERMISSION_SALES")
                      .requestMatchers("/products/**").hasAuthority("PERMISSION_PRODUCTS")
                      .requestMatchers("/categories/**").hasAuthority("PERMISSION_CATEGORIES")
                      .requestMatchers("/brands/**").hasAuthority("PERMISSION_BRANDS")
                      .requestMatchers("/units/**").hasAuthority("PERMISSION_UNITS")
                      .requestMatchers(HttpMethod.GET, "/customers/**").hasAnyAuthority("PERMISSION_CUSTOMERS", "PERMISSION_SALES")
                      .requestMatchers("/customers/**").hasAuthority("PERMISSION_CUSTOMERS")
                      .requestMatchers("/suppliers/**").hasAuthority("PERMISSION_SUPPLIERS")
                      .requestMatchers("/sales/**").hasAuthority("PERMISSION_SALES")
                      .requestMatchers("/sale-returns/**").hasAuthority("PERMISSION_SALES")
                      .requestMatchers("/shipments/**").hasAuthority("PERMISSION_SALES")
                      .requestMatchers("/purchases/**").hasAuthority("PERMISSION_PURCHASES")
                      .requestMatchers("/purchase-returns/**").hasAuthority("PERMISSION_PURCHASES")
                      .requestMatchers("/expenses/**").hasAuthority("PERMISSION_EXPENSES")
                      .requestMatchers("/reports/**").hasAuthority("PERMISSION_REPORTS")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
