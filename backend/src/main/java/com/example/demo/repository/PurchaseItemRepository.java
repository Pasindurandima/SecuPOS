package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.PurchaseItem;

@Repository
public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
    
    List<PurchaseItem> findByPurchaseId(Long purchaseId);
    
    List<PurchaseItem> findByProductId(Long productId);
}
