package com.example.demo.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.TaxRate;
public interface TaxRateRepository extends JpaRepository<TaxRate, Long> { List<TaxRate> findByUserIdAndActiveTrueOrderByName(Long userId); }