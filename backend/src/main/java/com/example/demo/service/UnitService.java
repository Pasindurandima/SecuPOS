package com.example.demo.service;

import com.example.demo.dto.UnitRequest;
import com.example.demo.dto.UnitResponse;
import com.example.demo.entity.Unit;
import com.example.demo.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UnitService {

    private final UnitRepository unitRepository;

    @Transactional
    public UnitResponse createUnit(UnitRequest request) {
        // Validate name uniqueness
        if (unitRepository.existsByName(request.getName())) {
            throw new RuntimeException("Unit name already exists: " + request.getName());
        }

        // Validate short name uniqueness
        if (unitRepository.existsByShortName(request.getShortName())) {
            throw new RuntimeException("Unit short name already exists: " + request.getShortName());
        }

        Unit unit = Unit.builder()
                .name(request.getName())
                .shortName(request.getShortName())
                .allowDecimal(request.getAllowDecimal() != null ? request.getAllowDecimal() : false)
                .description(request.getDescription())
                .build();

        Unit savedUnit = unitRepository.save(unit);
        return mapToResponse(savedUnit);
    }

    public List<UnitResponse> getAllUnits() {
        return unitRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UnitResponse getUnitById(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + id));
        return mapToResponse(unit);
    }

    @Transactional
    public UnitResponse updateUnit(Long id, UnitRequest request) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unit not found with id: " + id));

        // Validate name uniqueness (excluding current unit)
        if (unitRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Unit name already exists: " + request.getName());
        }

        // Validate short name uniqueness (excluding current unit)
        if (unitRepository.existsByShortNameAndIdNot(request.getShortName(), id)) {
            throw new RuntimeException("Unit short name already exists: " + request.getShortName());
        }

        unit.setName(request.getName());
        unit.setShortName(request.getShortName());
        unit.setAllowDecimal(request.getAllowDecimal() != null ? request.getAllowDecimal() : false);
        unit.setDescription(request.getDescription());

        Unit updatedUnit = unitRepository.save(unit);
        return mapToResponse(updatedUnit);
    }

    @Transactional
    public void deleteUnit(Long id) {
        if (!unitRepository.existsById(id)) {
            throw new RuntimeException("Unit not found with id: " + id);
        }
        unitRepository.deleteById(id);
    }

    public List<UnitResponse> searchUnits(String search) {
        if (search == null || search.trim().isEmpty()) {
            return getAllUnits();
        }
        return unitRepository.searchUnits(search).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UnitResponse mapToResponse(Unit unit) {
        return UnitResponse.builder()
                .id(unit.getId())
                .name(unit.getName())
                .shortName(unit.getShortName())
                .allowDecimal(unit.getAllowDecimal())
                .description(unit.getDescription())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
