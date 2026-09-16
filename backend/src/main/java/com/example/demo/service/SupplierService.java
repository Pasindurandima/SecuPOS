package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.SupplierRequest;
import com.example.demo.dto.SupplierResponse;
import com.example.demo.entity.Supplier;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.SupplierRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        // Check if email already exists
        if (request.getEmail() != null && supplierRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Supplier with email " + request.getEmail() + " already exists");
        }

        // Check if phone already exists
        if (supplierRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Supplier with phone " + request.getPhone() + " already exists");
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .contactPerson(request.getContactPerson())
                .alternatePhone(request.getAlternatePhone())
                .country(request.getCountry())
                .taxNumber(request.getTaxNumber())
                .bankName(request.getBankName())
                .accountNumber(request.getAccountNumber())
                .accountHolderName(request.getAccountHolderName())
                .paymentTerms(request.getPaymentTerms())
                .creditLimit(request.getCreditLimit())
                .website(request.getWebsite())
                .notes(request.getNotes())
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);
        return dtoMapper.toSupplierResponse(savedSupplier);
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));

        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && 
            !request.getEmail().equals(supplier.getEmail()) && 
            supplierRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Supplier with email " + request.getEmail() + " already exists");
        }

        // Check if phone is being changed and if new phone already exists
        if (!request.getPhone().equals(supplier.getPhone()) && 
            supplierRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Supplier with phone " + request.getPhone() + " already exists");
        }

        supplier.setName(request.getName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setZipCode(request.getZipCode());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setAlternatePhone(request.getAlternatePhone());
        supplier.setCountry(request.getCountry());
        supplier.setTaxNumber(request.getTaxNumber());
        supplier.setBankName(request.getBankName());
        supplier.setAccountNumber(request.getAccountNumber());
        supplier.setAccountHolderName(request.getAccountHolderName());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setCreditLimit(request.getCreditLimit());
        supplier.setWebsite(request.getWebsite());
        supplier.setNotes(request.getNotes());

        Supplier updatedSupplier = supplierRepository.save(supplier);
        return dtoMapper.toSupplierResponse(updatedSupplier);
    }

    public SupplierResponse getSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        return dtoMapper.toSupplierResponse(supplier);
    }

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(dtoMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    public List<SupplierResponse> searchSuppliers(String name) {
        return supplierRepository.findByNameContainingIgnoreCase(name).stream()
                .map(dtoMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }
}
