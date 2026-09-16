package com.example.demo.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.SettingsProfile;
public interface SettingsProfileRepository extends JpaRepository<SettingsProfile, Long> { Optional<SettingsProfile> findByUserId(Long userId); }