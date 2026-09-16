package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseCategoryRequest {
    @NotBlank(message = "Category name is required")
    private String name;
    @NotBlank(message = "Category code is required")
    private String code;
    private String description;
}
