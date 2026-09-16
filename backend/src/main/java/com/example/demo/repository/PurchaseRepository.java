package com.example.demo.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Purchase;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    long countByUserId(Long userId);
    
    Optional<Purchase> findByPurchaseNumber(String purchaseNumber);
    
    List<Purchase> findBySupplierId(Long supplierId);
    
    List<Purchase> findByStatus(Purchase.PurchaseStatus status);
    
    List<Purchase> findByPurchaseDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT p FROM Purchase p WHERE p.purchaseDate >= :startDate AND p.purchaseDate <= :endDate ORDER BY p.purchaseDate DESC")
    List<Purchase> findPurchasesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(p.total) FROM Purchase p WHERE p.status = 'RECEIVED' AND p.purchaseDate >= :startDate AND p.purchaseDate <= :endDate")
    BigDecimal getTotalPurchasesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT p FROM Purchase p ORDER BY p.purchaseDate DESC")
    List<Purchase> findAllOrderByDateDesc();
}
