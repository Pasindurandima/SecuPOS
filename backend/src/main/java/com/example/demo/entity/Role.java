package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    // Store permissions as JSON string or use ElementCollection
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id"))
    @Column(name = "permission")
    @Builder.Default
    private Set<String> permissions = new HashSet<>();

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("role")
    private Set<User> users = new HashSet<>();

    // Helper method to check if role has a specific permission
    public boolean hasPermission(String permission) {
        return permissions != null && permissions.contains(permission);
    }

    // Helper method to add permission
    public void addPermission(String permission) {
        if (permissions == null) {
            permissions = new HashSet<>();
        }
        permissions.add(permission);
    }

    // Helper method to remove permission
    public void removePermission(String permission) {
        if (permissions != null) {
            permissions.remove(permission);
        }
    }

    // Get user count
    public int getUserCount() {
        return users != null ? users.size() : 0;
    }
}
