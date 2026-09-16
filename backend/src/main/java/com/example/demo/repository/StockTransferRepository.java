package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.StockTransfer;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {

    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    @Query("SELECT st FROM StockTransfer st WHERE st.isActive = true ORDER BY st.transferDate DESC")
    List<StockTransfer> findAllActive();

    List<StockTransfer> findByFromLocationOrToLocationOrderByTransferDateDesc(String fromLocation, String toLocation);

    @Query("SELECT COALESCE(MAX(CAST(SUBSTRING(st.transferNumber, 4) AS integer)), 0) FROM StockTransfer st WHERE st.transferNumber LIKE 'ST-%'")
    Integer findMaxTransferNumber();
}
