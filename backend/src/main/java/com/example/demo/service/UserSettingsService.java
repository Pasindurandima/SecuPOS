package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.UserSettingsDTO;
import com.example.demo.entity.User;
import com.example.demo.model.UserSettings;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.UserSettingsRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserSettingsRepository settingsRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserSettingsDTO getUserSettings(Long userId) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));
        
        return convertToDTO(settings);
    }

    @Transactional
    public UserSettingsDTO updateUserSettings(Long userId, UserSettingsDTO dto) {
        UserSettings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(userId));

        // Update notification settings
        if (dto.getEmailNotifications() != null) {
            settings.setEmailNotifications(dto.getEmailNotifications());
        }
        if (dto.getPushNotifications() != null) {
            settings.setPushNotifications(dto.getPushNotifications());
        }
        if (dto.getSalesNotifications() != null) {
            settings.setSalesNotifications(dto.getSalesNotifications());
        }
        if (dto.getInventoryNotifications() != null) {
            settings.setInventoryNotifications(dto.getInventoryNotifications());
        }
        if (dto.getReportNotifications() != null) {
            settings.setReportNotifications(dto.getReportNotifications());
        }

        // Update display settings
        if (dto.getTheme() != null) {
            settings.setTheme(dto.getTheme());
        }
        if (dto.getLanguage() != null) {
            settings.setLanguage(dto.getLanguage());
        }
        if (dto.getDateFormat() != null) {
            settings.setDateFormat(dto.getDateFormat());
        }
        if (dto.getCurrency() != null) {
            settings.setCurrency(dto.getCurrency());
        }

        // Update system settings
        if (dto.getAutoBackup() != null) {
            settings.setAutoBackup(dto.getAutoBackup());
        }
        if (dto.getBackupFrequency() != null) {
            settings.setBackupFrequency(dto.getBackupFrequency());
        }
        if (dto.getDataRetention() != null) {
            settings.setDataRetention(dto.getDataRetention());
        }

        UserSettings savedSettings = settingsRepository.save(settings);
        return convertToDTO(savedSettings);
    }

    @Transactional
    public void resetToDefaults(Long userId) {
        settingsRepository.findByUserId(userId).ifPresent(settings -> {
            settings.setEmailNotifications(true);
            settings.setPushNotifications(true);
            settings.setSalesNotifications(true);
            settings.setInventoryNotifications(true);
            settings.setReportNotifications(false);
            settings.setTheme("light");
            settings.setLanguage("en");
            settings.setDateFormat("MM/DD/YYYY");
            settings.setCurrency("LKR");
            settings.setAutoBackup(true);
            settings.setBackupFrequency("daily");
            settings.setDataRetention(90);
            settingsRepository.save(settings);
        });
    }

    private UserSettings createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserSettings settings = new UserSettings();
        settings.setUser(user);
        settings.setEmailNotifications(true);
        settings.setPushNotifications(true);
        settings.setSalesNotifications(true);
        settings.setInventoryNotifications(true);
        settings.setReportNotifications(false);
        settings.setTheme("light");
        settings.setLanguage("en");
        settings.setDateFormat("MM/DD/YYYY");
        settings.setCurrency("LKR");
        settings.setAutoBackup(true);
        settings.setBackupFrequency("daily");
        settings.setDataRetention(90);

        return settingsRepository.save(settings);
    }

    private UserSettingsDTO convertToDTO(UserSettings settings) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.setEmailNotifications(settings.getEmailNotifications());
        dto.setPushNotifications(settings.getPushNotifications());
        dto.setSalesNotifications(settings.getSalesNotifications());
        dto.setInventoryNotifications(settings.getInventoryNotifications());
        dto.setReportNotifications(settings.getReportNotifications());
        dto.setTheme(settings.getTheme());
        dto.setLanguage(settings.getLanguage());
        dto.setDateFormat(settings.getDateFormat());
        dto.setCurrency(settings.getCurrency());
        dto.setAutoBackup(settings.getAutoBackup());
        dto.setBackupFrequency(settings.getBackupFrequency());
        dto.setDataRetention(settings.getDataRetention());
        return dto;
    }
}
