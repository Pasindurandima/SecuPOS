package com.example.demo.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.ReceiptPrinter;
public interface ReceiptPrinterRepository extends JpaRepository<ReceiptPrinter, Long> { List<ReceiptPrinter> findByUserIdAndActiveTrueOrderByName(Long userId); }