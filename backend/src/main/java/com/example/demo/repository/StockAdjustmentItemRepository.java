package com.example.demo.repository;

import com.example.demo.entity.StockAdjustmentItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockAdjustmentItemRepository extends JpaRepository<StockAdjustmentItem, Long> {
    
    List<StockAdjustmentItem> findByStockAdjustmentId(Long stockAdjustmentId);
    
    List<StockAdjustmentItem> findByProductId(Long productId);
}
