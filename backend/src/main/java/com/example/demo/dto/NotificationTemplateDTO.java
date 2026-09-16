package com.example.demo.dto;

import lombok.Data;

@Data
public class NotificationTemplateDTO {
    private Long id;
    private String category;
    private String notificationType;
    private String name;
    private String triggerEvent;
    private String subject;
    private String message;
    private Boolean active;
}