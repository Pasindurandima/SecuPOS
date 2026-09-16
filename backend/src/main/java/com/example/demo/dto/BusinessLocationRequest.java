package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessLocationRequest {
    @NotBlank(message = "Location name is required")
    private String name;
    private String code;
    private String address;
    private String phone;
    @Email(message = "Email must be valid")
    private String email;
}
