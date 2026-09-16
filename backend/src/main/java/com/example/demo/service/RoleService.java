package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.RoleDTO;
import com.example.demo.dto.RoleRequest;
import com.example.demo.entity.Role;
import com.example.demo.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleDTO createRole(RoleRequest request) {
        // Check if role name already exists
        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role with name '" + request.getName() + "' already exists");
        }

        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .permissions(request.getPermissions())
                .build();
        
        role.setIsActive(true);
        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    public RoleDTO updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Check if new name conflicts with existing role (excluding current role)
        if (!role.getName().equals(request.getName()) && roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role with name '" + request.getName() + "' already exists");
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());
        role.setPermissions(request.getPermissions());

        Role updatedRole = roleRepository.save(role);
        return convertToDTO(updatedRole);
    }

    @Transactional(readOnly = true)
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .filter(role -> Boolean.TRUE.equals(role.getIsActive()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));
        return convertToDTO(role);
    }

    @Transactional(readOnly = true)
    public RoleDTO getRoleByName(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Role not found with name: " + name));
        return convertToDTO(role);
    }

    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Check if role has users assigned
        Long userCount = roleRepository.countUsersByRoleId(id);
        if (userCount != null && userCount > 0) {
            throw new RuntimeException("Cannot delete role '" + role.getName() + "' as it has " + userCount + " user(s) assigned");
        }

        // Soft delete
        role.setIsActive(false);
        roleRepository.save(role);
    }

    public void hardDeleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        // Check if role has users assigned
        Long userCount = roleRepository.countUsersByRoleId(id);
        if (userCount != null && userCount > 0) {
            throw new RuntimeException("Cannot delete role '" + role.getName() + "' as it has " + userCount + " user(s) assigned");
        }

        roleRepository.delete(role);
    }

    private RoleDTO convertToDTO(Role role) {
        Long userCount = roleRepository.countUsersByRoleId(role.getId());
        
        return RoleDTO.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(role.getPermissions())
                .userCount(userCount != null ? userCount.intValue() : 0)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .isActive(role.getIsActive())
                .build();
    }

    // Initialize default roles if needed
    public void initializeDefaultRoles() {
        if (roleRepository.count() == 0) {
            // Create Admin role with all permissions
            Role adminRole = Role.builder()
                    .name("Admin")
                    .description("Full system access")
                    .build();
            adminRole.setIsActive(true);
            adminRole.addPermission("dashboard");
            adminRole.addPermission("products");
            adminRole.addPermission("categories");
            adminRole.addPermission("brands");
            adminRole.addPermission("units");
            adminRole.addPermission("customers");
            adminRole.addPermission("suppliers");
            adminRole.addPermission("sales");
            adminRole.addPermission("purchases");
            adminRole.addPermission("expenses");
            adminRole.addPermission("reports");
            adminRole.addPermission("users");
            adminRole.addPermission("roles");
            adminRole.addPermission("settings");
            roleRepository.save(adminRole);

            // Create Manager role
            Role managerRole = Role.builder()
                    .name("Manager")
                    .description("Limited management access")
                    .build();
            managerRole.setIsActive(true);
            managerRole.addPermission("dashboard");
            managerRole.addPermission("products");
            managerRole.addPermission("categories");
            managerRole.addPermission("brands");
            managerRole.addPermission("customers");
            managerRole.addPermission("suppliers");
            managerRole.addPermission("sales");
            managerRole.addPermission("purchases");
            managerRole.addPermission("reports");
            roleRepository.save(managerRole);

            // Create Staff role
            Role staffRole = Role.builder()
                    .name("Staff")
                    .description("Basic user access")
                    .build();
            staffRole.setIsActive(true);
            staffRole.addPermission("dashboard");
            staffRole.addPermission("products");
            staffRole.addPermission("customers");
            staffRole.addPermission("sales");
            roleRepository.save(staffRole);
        }
    }
}
