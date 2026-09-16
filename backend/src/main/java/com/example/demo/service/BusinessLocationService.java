package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.BusinessLocationRequest;
import com.example.demo.dto.BusinessLocationResponse;
import com.example.demo.entity.BusinessLocation;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BusinessLocationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BusinessLocationService {

    private final BusinessLocationRepository repository;

    @Transactional(readOnly = true)
    public List<BusinessLocationResponse> getAll() {
        return repository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BusinessLocationResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    @Transactional
    public BusinessLocationResponse create(BusinessLocationRequest request) {
        String name = request.getName().trim();
        String code = normalize(request.getCode());
        validateUnique(name, code, null);

        BusinessLocation location = BusinessLocation.builder()
                .name(name)
                .code(code)
                .address(normalize(request.getAddress()))
                .phone(normalize(request.getPhone()))
                .email(normalize(request.getEmail()))
                .build();
        return toResponse(repository.save(location));
    }

    @Transactional
    public BusinessLocationResponse update(Long id, BusinessLocationRequest request) {
        BusinessLocation location = findActive(id);
        String name = request.getName().trim();
        String code = normalize(request.getCode());
        validateUnique(name, code, id);

        location.setName(name);
        location.setCode(code);
        location.setAddress(normalize(request.getAddress()));
        location.setPhone(normalize(request.getPhone()));
        location.setEmail(normalize(request.getEmail()));
        return toResponse(repository.save(location));
    }

    @Transactional
    public void delete(Long id) {
        BusinessLocation location = findActive(id);
        location.setIsActive(false);
        repository.save(location);
    }

    private BusinessLocation findActive(Long id) {
        return repository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business location not found with id: " + id));
    }

    private void validateUnique(String name, String code, Long currentId) {
        boolean duplicateName = currentId == null
                ? repository.existsByNameIgnoreCase(name)
                : repository.existsByNameIgnoreCaseAndIdNot(name, currentId);
        if (duplicateName) {
            throw new BadRequestException("Location name already exists: " + name);
        }
        if (code != null) {
            boolean duplicateCode = currentId == null
                    ? repository.existsByCodeIgnoreCase(code)
                    : repository.existsByCodeIgnoreCaseAndIdNot(code, currentId);
            if (duplicateCode) {
                throw new BadRequestException("Location code already exists: " + code);
            }
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BusinessLocationResponse toResponse(BusinessLocation location) {
        return BusinessLocationResponse.builder()
                .id(location.getId())
                .name(location.getName())
                .code(location.getCode())
                .address(location.getAddress())
                .phone(location.getPhone())
                .email(location.getEmail())
                .isActive(location.getIsActive())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}
