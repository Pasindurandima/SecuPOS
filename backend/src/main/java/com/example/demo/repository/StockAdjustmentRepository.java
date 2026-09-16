package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.StockAdjustment;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {

    long countByUserId(Long userId);
    
    Optional<StockAdjustment> findByReferenceNumber(String referenceNumber);
    
    @Query("SELECT sa FROM StockAdjustment sa WHERE sa.location = :location AND sa.isActive = true ORDER BY sa.adjustmentDate DESC")
    List<StockAdjustment> findByLocation(@Param("location") String location);
    
    List<StockAdjustment> findByAdjustmentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT sa FROM StockAdjustment sa WHERE sa.isActive = true ORDER BY sa.adjustmentDate DESC")
    List<StockAdjustment> findAllActive();
    
    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(sa.referenceNumber, 4) AS integer)), 0) FROM StockAdjustment sa WHERE sa.referenceNumber LIKE 'SA-%'")
    Integer findMaxReferenceNumber();
}
