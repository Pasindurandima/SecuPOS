package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnitResponse {
    private Long id;
    private String name;
    private String shortName;
    private Boolean allowDecimal;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
