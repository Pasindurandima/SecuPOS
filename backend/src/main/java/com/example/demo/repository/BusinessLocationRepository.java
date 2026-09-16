package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.BusinessLocation;

@Repository
public interface BusinessLocationRepository extends JpaRepository<BusinessLocation, Long> {
    @Query("SELECT location FROM BusinessLocation location WHERE location.isActive = true ORDER BY location.name ASC")
    List<BusinessLocation> findAllActive();

    Optional<BusinessLocation> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);

    @Query("SELECT location FROM BusinessLocation location WHERE location.id = :id AND location.isActive = true")
    Optional<BusinessLocation> findActiveById(@Param("id") Long id);
}
