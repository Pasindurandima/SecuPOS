package com.example.demo.repository;

import com.example.demo.entity.LabelPrint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LabelPrintRepository extends JpaRepository<LabelPrint, Long> {

    List<LabelPrint> findByProductId(Long productId);

    List<LabelPrint> findByPrintedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT lp FROM LabelPrint lp WHERE lp.printedBy.id = :userId ORDER BY lp.printedAt DESC")
    List<LabelPrint> findByUserId(@Param("userId") Long userId);

    @Query("SELECT lp FROM LabelPrint lp ORDER BY lp.printedAt DESC")
    List<LabelPrint> findAllOrderByPrintedAtDesc();

    @Query("SELECT SUM(lp.numberOfLabels) FROM LabelPrint lp WHERE lp.product.id = :productId")
    Long getTotalLabelsPrintedForProduct(@Param("productId") Long productId);
}
