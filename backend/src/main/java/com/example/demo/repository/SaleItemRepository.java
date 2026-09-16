package com.example.demo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.SaleItem;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    
    List<SaleItem> findBySaleId(Long saleId);
    
    List<SaleItem> findByProductId(Long productId);
    
    @Query("SELECT si FROM SaleItem si WHERE si.product.id = :productId AND si.sale.saleDate >= :startDate AND si.sale.saleDate <= :endDate")
    List<SaleItem> findByProductAndDateRange(@Param("productId") Long productId, 
                                             @Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);
}
