package com.example.demo.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.AuthResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
                return register(request, true);
        }

        @Transactional
        public AuthResponse registerPublic(RegisterRequest request) {
                return register(request, false);
        }

        private AuthResponse register(RegisterRequest request, boolean allowRequestedRole) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        // Get role - either by ID or default to "Staff" role
        Role role = null;
        if (allowRequestedRole && request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new BadRequestException("Role not found"));
        } else if (allowRequestedRole && request.getRoleName() != null && !request.getRoleName().isBlank()) {
            role = roleRepository.findByNameIgnoreCase(request.getRoleName().trim())
                    .orElseThrow(() -> new BadRequestException("Role not found"));
        } else {
            // Try to find default "Staff" role, or get any role as fallback
            role = roleRepository.findByName("Staff")
                    .or(() -> roleRepository.findByName("User"))
                    .or(() -> roleRepository.findById(1L))
                    .orElse(null);
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .prefix(request.getPrefix())
                .phone(request.getPhone())
                .address(request.getAddress())
                .enableServiceStaffPin(Boolean.TRUE.equals(request.getEnableServiceStaffPin()))
                .allowLogin(request.getAllowLogin() == null || request.getAllowLogin())
                .accessAllLocations(request.getAccessAllLocations() == null || request.getAccessAllLocations())
                .roleName(role != null ? role.getName() : null)
                .role(role)
                .build();
        
        user.setIsActive(request.getIsActive() == null || request.getIsActive());
        user = userRepository.save(user);

        String token = tokenProvider.generateToken(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : "No Role")
                .permissions(user.getRole() != null ? user.getRole().getPermissions() : java.util.Set.of())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("User not found"));

        String token = tokenProvider.generateToken(user.getUsername());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getName() : "No Role")
                .permissions(user.getRole() != null ? user.getRole().getPermissions() : java.util.Set.of())
                .build();
    }
}
