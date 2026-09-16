package com.example.demo.dto;

import lombok.Data;

@Data
public class UserSettingsDTO {
    // Notification Settings
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private Boolean salesNotifications;
    private Boolean inventoryNotifications;
    private Boolean reportNotifications;
    
    // Display Settings
    private String theme;
    private String language;
    private String dateFormat;
    private String currency;
    
    // System Settings
    private Boolean autoBackup;
    private String backupFrequency;
    private Integer dataRetention;
}
