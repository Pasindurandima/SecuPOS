package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.PurchaseReturn;

@Repository
public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, Long> {
    @EntityGraph(attributePaths = {
            "items",
            "items.product",
            "items.product.category",
            "items.product.brand"
    })
    List<PurchaseReturn> findAllByOrderByReturnDateDesc();

    @Override
    @EntityGraph(attributePaths = {
            "items",
            "items.product",
            "items.product.category",
            "items.product.brand"
    })
    java.util.Optional<PurchaseReturn> findById(Long id);
}
