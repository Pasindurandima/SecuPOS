package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.UserSettingsDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.UserSettingsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users/settings")
@RequiredArgsConstructor
public class UserSettingsController {

    private final UserSettingsService settingsService;
    private final UserRepository userRepository;

    private Long userId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return userRepository.findByUsername(authentication.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserSettingsDTO>> getUserSettings(Authentication authentication) {
        UserSettingsDTO settings = settingsService.getUserSettings(userId(authentication));
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved successfully", settings));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UserSettingsDTO>> updateUserSettings(
            Authentication authentication,
            @RequestBody UserSettingsDTO settingsDTO) {
        UserSettingsDTO updatedSettings = settingsService.updateUserSettings(userId(authentication), settingsDTO);
        return ResponseEntity.ok(ApiResponse.success("Settings updated successfully", updatedSettings));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Void>> resetToDefaults(Authentication authentication) {
        settingsService.resetToDefaults(userId(authentication));
        return ResponseEntity.ok(ApiResponse.success("Settings reset to defaults", null));
    }
}
