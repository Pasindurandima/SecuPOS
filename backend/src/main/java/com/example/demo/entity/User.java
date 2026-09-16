package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User extends BaseEntity implements UserDetails {

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String prefix;

    private String phone;

    private String address;

    @Column(name = "enable_service_staff_pin", nullable = false)
    private Boolean enableServiceStaffPin = false;

    @Column(name = "allow_login", nullable = false)
    private Boolean allowLogin = true;

    @Column(name = "access_all_locations", nullable = false)
    private Boolean accessAllLocations = true;

    @Column(name = "role")
    private String roleName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = true)
    @JsonIgnoreProperties("users")
    private Role role;

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Add role-based authority
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            
            // Add permission-based authorities
            Set<String> permissions = role.getPermissions();
            if ("admin".equalsIgnoreCase(role.getName())) {
                permissions = Set.of("dashboard", "products", "categories", "brands", "units",
                        "customers", "suppliers", "sales", "purchases", "expenses", "reports",
                        "users", "roles", "settings");
            }
            if (permissions != null) {
                authorities.addAll(
                    permissions.stream()
                        .map(permission -> new SimpleGrantedAuthority("PERMISSION_" + permission.toUpperCase()))
                        .collect(Collectors.toList())
                );
            }
        }
        
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.getIsActive() != null && this.getIsActive();
    }
}
