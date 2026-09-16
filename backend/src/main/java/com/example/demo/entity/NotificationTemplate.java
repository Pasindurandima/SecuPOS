package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notification_templates")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class NotificationTemplate extends BaseEntity {
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private String category;
    @Column(nullable = false)
    private String notificationType;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String triggerEvent;
    private String subject;
    @Column(length = 4000, nullable = false)
    private String message;
    @Column(nullable = false)
    private Boolean active = true;
}