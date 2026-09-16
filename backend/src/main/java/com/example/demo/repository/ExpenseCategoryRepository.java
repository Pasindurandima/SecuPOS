package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.ExpenseCategory;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
    @Query("SELECT category FROM ExpenseCategory category WHERE category.isActive = true ORDER BY category.name ASC")
    List<ExpenseCategory> findAllActive();

    @Query("SELECT category FROM ExpenseCategory category WHERE category.code = :code AND category.isActive = true")
    Optional<ExpenseCategory> findActiveByCode(@Param("code") String code);

    @Query("SELECT category FROM ExpenseCategory category WHERE category.id = :id AND category.isActive = true")
    Optional<ExpenseCategory> findActiveById(@Param("id") Long id);

    boolean existsByNameIgnoreCase(String name);
    boolean existsByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    boolean existsByCodeIgnoreCaseAndIdNot(String code, Long id);
}
