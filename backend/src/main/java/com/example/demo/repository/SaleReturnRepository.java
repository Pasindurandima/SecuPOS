package com.example.demo.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.demo.entity.SaleReturn;

@Repository
public interface SaleReturnRepository extends JpaRepository<SaleReturn, Long> {
    List<SaleReturn> findAllByOrderByReturnDateDesc();
}
