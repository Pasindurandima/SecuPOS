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
@Table(name = "notifications")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = false)
public class Notification extends BaseEntity {
    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(nullable = false)
    private String type;
    @Column(nullable = false)
    private String title;
    @Column(length = 1000, nullable = false)
    private String message;
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;
    @Column(unique = true)
    private String reference;
}