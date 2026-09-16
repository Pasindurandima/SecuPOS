package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(String name);

    Optional<Role> findByNameIgnoreCase(String name);
    
    boolean existsByName(String name);
    
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.id = :roleId")
    Long countUsersByRoleId(Long roleId);
}
