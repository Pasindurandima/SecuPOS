package com.example.demo.model;

import java.time.LocalDateTime;

import com.example.demo.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    // Notification Settings
    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "sales_notifications")
    private Boolean salesNotifications = true;

    @Column(name = "inventory_notifications")
    private Boolean inventoryNotifications = true;

    @Column(name = "report_notifications")
    private Boolean reportNotifications = false;

    // Display Settings
    @Column(name = "theme")
    private String theme = "light";

    @Column(name = "language")
    private String language = "en";

    @Column(name = "date_format")
    private String dateFormat = "MM/DD/YYYY";

    @Column(name = "currency")
    private String currency = "LKR";

    // System Settings
    @Column(name = "auto_backup")
    private Boolean autoBackup = true;

    @Column(name = "backup_frequency")
    private String backupFrequency = "daily";

    @Column(name = "data_retention")
    private Integer dataRetention = 90;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
