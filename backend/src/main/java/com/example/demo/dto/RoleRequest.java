package com.example.demo.dto;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequest {
    
    @NotBlank(message = "Role name is required")
    private String name;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotEmpty(message = "At least one permission is required")
    private Set<String> permissions;
}
