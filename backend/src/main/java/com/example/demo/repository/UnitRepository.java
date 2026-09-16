package com.example.demo.repository;

import com.example.demo.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    Optional<Unit> findByName(String name);

    Optional<Unit> findByShortName(String shortName);

    @Query("SELECT u FROM Unit u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.shortName) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Unit> searchUnits(@Param("search") String search);

    boolean existsByName(String name);

    boolean existsByShortName(String shortName);

    boolean existsByNameAndIdNot(String name, Long id);

    boolean existsByShortNameAndIdNot(String shortName, Long id);
}
