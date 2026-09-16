package com.example.demo.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Sale;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    long countByUserId(Long userId);
    
    Optional<Sale> findByInvoiceNumber(String invoiceNumber);
    
    List<Sale> findByCustomerId(Long customerId);
    
    List<Sale> findByStatus(Sale.SaleStatus status);
    
    List<Sale> findBySaleDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT s FROM Sale s WHERE s.saleDate >= :startDate AND s.saleDate <= :endDate ORDER BY s.saleDate DESC")
    List<Sale> findSalesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(s.total) FROM Sale s WHERE s.status = 'COMPLETED' AND s.saleDate >= :startDate AND s.saleDate <= :endDate")
    BigDecimal getTotalSalesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = 'COMPLETED' AND s.saleDate >= :startDate AND s.saleDate <= :endDate")
    Long getCountByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT s FROM Sale s ORDER BY s.saleDate DESC")
    List<Sale> findAllOrderByDateDesc();
}
