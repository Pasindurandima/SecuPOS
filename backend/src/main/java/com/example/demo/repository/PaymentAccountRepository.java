package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.PaymentAccount;

@Repository
public interface PaymentAccountRepository extends JpaRepository<PaymentAccount, Long> {
    @Query("SELECT account FROM PaymentAccount account WHERE account.isActive = true ORDER BY account.name")
    List<PaymentAccount> findAllActive();

    @Query("SELECT account FROM PaymentAccount account WHERE account.id = :id AND account.isActive = true")
    Optional<PaymentAccount> findActiveById(@Param("id") Long id);

    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
