package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entity.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String prefix;
    private String phone;
    private String address;
    private Boolean enableServiceStaffPin;
    private Boolean allowLogin;
    private Boolean accessAllLocations;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .prefix(user.getPrefix())
                .phone(user.getPhone())
                .address(user.getAddress())
                .enableServiceStaffPin(user.getEnableServiceStaffPin())
                .allowLogin(user.getAllowLogin())
                .accessAllLocations(user.getAccessAllLocations())
                .role(user.getRole() != null
                    ? user.getRole().getName()
                    : (user.getRoleName() != null && !user.getRoleName().isBlank()
                        ? user.getRoleName()
                        : "No Role"))
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
