package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.dto.UserUpdateRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.ExpenseRepository;
import com.example.demo.repository.PurchaseRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.SaleRepository;
import com.example.demo.repository.StockAdjustmentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000"
})
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        User user = currentUser(authentication);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", UserResponse.from(user)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateCurrentUser(Authentication authentication,
            @RequestBody UserUpdateRequest request) {
        User user = currentUser(authentication);
        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(request.getEmail().trim())) {
            throw new BadRequestException("Email already exists");
        }
        if (request.getUsername() != null && !request.getUsername().isBlank() && !request.getUsername().equalsIgnoreCase(user.getUsername()) && userRepository.existsByUsername(request.getUsername().trim())) {
            throw new BadRequestException("Username already exists");
        }
        if (request.getUsername() != null && !request.getUsername().isBlank()) user.setUsername(request.getUsername().trim());
        if (request.getEmail() != null && !request.getEmail().isBlank()) user.setEmail(request.getEmail().trim());
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName().trim());
        if (request.getLastName() != null) user.setLastName(request.getLastName().trim());
        if (request.getPrefix() != null) user.setPrefix(request.getPrefix().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) user.setAddress(request.getAddress().trim());
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", UserResponse.from(userRepository.save(user))));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = currentUser(authentication);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters long");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) throw new BadRequestException("Authenticated user not found");
        return userRepository.findByUsername(authentication.getName()).orElseThrow(() -> new BadRequestException("Authenticated user not found"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERMISSION_USERS')")
    public ResponseEntity<ApiResponse<AuthResponse>> createUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", authService.register(request)));
    }
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", UserResponse.from(user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            user.setUsername(request.getUsername().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPrefix() != null) {
            user.setPrefix(request.getPrefix().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (request.getAllowLogin() != null) {
            user.setAllowLogin(request.getAllowLogin());
        }
        if (request.getAccessAllLocations() != null) {
            user.setAccessAllLocations(request.getAccessAllLocations());
        }
        if (request.getRoleName() != null && !request.getRoleName().isBlank()) {
            Role role = roleRepository.findByNameIgnoreCase(request.getRoleName().trim())
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRole(role);
            user.setRoleName(role.getName());
        }

        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", UserResponse.from(user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("User not found", null));
        }

        long saleCount = saleRepository.countByUserId(id);
        long purchaseCount = purchaseRepository.countByUserId(id);
        long expenseCount = expenseRepository.countByUserId(id);
        long stockAdjustmentCount = stockAdjustmentRepository.countByUserId(id);

        long totalLinkedRecords = saleCount + purchaseCount + expenseCount + stockAdjustmentCount;
        if (totalLinkedRecords > 0) {
            StringBuilder message = new StringBuilder("Cannot delete user because it is linked to ");
            if (saleCount > 0) {
                message.append(saleCount).append(" sale(s)");
            }
            if (purchaseCount > 0) {
                if (message.length() > "Cannot delete user because it is linked to ".length()) {
                    message.append(", ");
                }
                message.append(purchaseCount).append(" purchase(s)");
            }
            if (expenseCount > 0) {
                if (message.length() > "Cannot delete user because it is linked to ".length()) {
                    message.append(", ");
                }
                message.append(expenseCount).append(" expense(s)");
            }
            if (stockAdjustmentCount > 0) {
                if (message.length() > "Cannot delete user because it is linked to ".length()) {
                    message.append(", ");
                }
                message.append(stockAdjustmentCount).append(" stock adjustment(s)");
            }
            message.append(". Remove or reassign those records first.");

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(message.toString(), null));
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
