package com.example.demo.repository;

import com.example.demo.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    
    // Find quotations by customer
    List<Quotation> findByCustomerId(Long customerId);
    
    // Find quotations by status
    List<Quotation> findByStatus(Quotation.QuotationStatus status);
    
    // Find quotations by date range
    @Query("SELECT q FROM Quotation q WHERE q.quotationDate BETWEEN :startDate AND :endDate")
    List<Quotation> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    // Find expired quotations
    @Query("SELECT q FROM Quotation q WHERE q.expiryDate < :currentDate AND q.status = 'PENDING'")
    List<Quotation> findExpiredQuotations(@Param("currentDate") LocalDate currentDate);
    
    // Search quotations by customer name or notes
    @Query("SELECT q FROM Quotation q WHERE " +
           "LOWER(q.customer.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(q.notes) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Quotation> searchQuotations(@Param("searchTerm") String searchTerm);
}
