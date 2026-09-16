package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.NotificationTemplateDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.NotificationService;
import com.example.demo.service.NotificationTemplateService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {
	private final NotificationTemplateService service;
	private final NotificationService notificationService;
	private final UserRepository userRepository;

	private Long userId(Authentication authentication) { if (authentication == null || authentication.getName() == null) throw new ResourceNotFoundException("Authenticated user not found"); return userRepository.findByUsername(authentication.getName()).map(user -> user.getId()).orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found")); }
	@GetMapping public ResponseEntity<ApiResponse<?>> list(Authentication authentication) { return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notificationService.list(userId(authentication)))); }
	@GetMapping("/templates") public ResponseEntity<ApiResponse<List<NotificationTemplateDTO>>> templates(Authentication authentication) { return ResponseEntity.ok(ApiResponse.success("Notification templates retrieved", service.list(userId(authentication)))); }
	@PostMapping("/templates") public ResponseEntity<ApiResponse<NotificationTemplateDTO>> create(Authentication authentication, @RequestBody NotificationTemplateDTO dto) { return ResponseEntity.ok(ApiResponse.success("Notification template saved", service.save(userId(authentication), dto))); }
	@PutMapping("/templates/{id}") public ResponseEntity<ApiResponse<NotificationTemplateDTO>> update(Authentication authentication, @PathVariable Long id, @RequestBody NotificationTemplateDTO dto) { dto.setId(id); return ResponseEntity.ok(ApiResponse.success("Notification template updated", service.save(userId(authentication), dto))); }
	@DeleteMapping("/templates/{id}") public ResponseEntity<ApiResponse<Void>> deleteTemplate(Authentication authentication, @PathVariable Long id) { service.delete(userId(authentication), id); return ResponseEntity.ok(ApiResponse.success("Notification template deleted", null)); }
	@PutMapping("/{id}/read") public ResponseEntity<ApiResponse<Void>> read(Authentication authentication, @PathVariable Long id) { notificationService.markRead(userId(authentication), id); return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null)); }
	@PutMapping("/mark-all-read") public ResponseEntity<ApiResponse<Void>> readAll(Authentication authentication) { notificationService.markAllRead(userId(authentication)); return ResponseEntity.ok(ApiResponse.success("Notifications marked as read", null)); }
	@DeleteMapping("/{id}") public ResponseEntity<ApiResponse<Void>> delete(Authentication authentication, @PathVariable Long id) { notificationService.delete(userId(authentication), id); return ResponseEntity.ok(ApiResponse.success("Notification deleted", null)); }
	@GetMapping("/count") public ResponseEntity<ApiResponse<Long>> count(Authentication authentication) { return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", notificationService.count(userId(authentication)))); }
}
