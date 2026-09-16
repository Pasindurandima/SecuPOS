package com.example.demo.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.QuotationItemRequest;
import com.example.demo.dto.QuotationRequest;
import com.example.demo.dto.QuotationResponse;
import com.example.demo.entity.Customer;
import com.example.demo.entity.Product;
import com.example.demo.entity.Quotation;
import com.example.demo.entity.QuotationItem;
import com.example.demo.entity.Sale;
import com.example.demo.entity.SaleItem;
import com.example.demo.repository.CustomerRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.QuotationRepository;
import com.example.demo.repository.SaleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    @Transactional
    public QuotationResponse createQuotation(QuotationRequest request) {
        // Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Create quotation
        Quotation quotation = new Quotation();
        quotation.setCustomer(customer);
        quotation.setQuotationDate(request.getQuotationDate());
        quotation.setExpiryDate(request.getExpiryDate());
        quotation.setTerms(request.getTerms());
        quotation.setNotes(request.getNotes());
        quotation.setStatus(Quotation.QuotationStatus.PENDING);

        // Add items
        double totalAmount = 0.0;
        for (QuotationItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            QuotationItem item = new QuotationItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            item.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : 0.0);
            
            // Calculate amounts will be done in @PrePersist
            quotation.addItem(item);
            
            // Calculate total
            double subtotal = item.getQuantity() * item.getUnitPrice();
            double tax = subtotal * (item.getTaxRate() / 100);
            totalAmount += subtotal + tax;
        }

        quotation.setTotalAmount(totalAmount);

        // Save quotation
        Quotation savedQuotation = quotationRepository.save(quotation);

        return new QuotationResponse(savedQuotation);
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getAllQuotations() {
        return quotationRepository.findAll().stream()
                .map(QuotationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuotationResponse getQuotationById(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        return new QuotationResponse(quotation);
    }

    @Transactional
    public QuotationResponse updateQuotation(Long id, QuotationRequest request) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        // Update customer if changed
        if (!quotation.getCustomer().getId().equals(request.getCustomerId())) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            quotation.setCustomer(customer);
        }

        // Update basic fields
        quotation.setQuotationDate(request.getQuotationDate());
        quotation.setExpiryDate(request.getExpiryDate());
        quotation.setTerms(request.getTerms());
        quotation.setNotes(request.getNotes());

        // Clear existing items
        quotation.getItems().clear();

        // Add new items
        double totalAmount = 0.0;
        for (QuotationItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemRequest.getProductId()));

            QuotationItem item = new QuotationItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());
            item.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : 0.0);
            
            quotation.addItem(item);
            
            // Calculate total
            double subtotal = item.getQuantity() * item.getUnitPrice();
            double tax = subtotal * (item.getTaxRate() / 100);
            totalAmount += subtotal + tax;
        }

        quotation.setTotalAmount(totalAmount);

        // Save quotation
        Quotation updatedQuotation = quotationRepository.save(quotation);

        return new QuotationResponse(updatedQuotation);
    }

    @Transactional
    public void deleteQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotationRepository.delete(quotation);
    }

    @Transactional
    public QuotationResponse updateStatus(Long id, Quotation.QuotationStatus status) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));
        quotation.setStatus(status);
        Quotation updatedQuotation = quotationRepository.save(quotation);
        return new QuotationResponse(updatedQuotation);
    }

    @Transactional
    public ApiResponse convertToSale(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quotation not found"));

        // Create sale from quotation
        Sale sale = Sale.builder()
                .customer(quotation.getCustomer())
                .saleDate(LocalDateTime.now())
                .status(Sale.SaleStatus.COMPLETED)
                .paymentMethod(Sale.PaymentMethod.CASH)
                .paidAmount(java.math.BigDecimal.valueOf(quotation.getTotalAmount()))
                .subtotal(java.math.BigDecimal.valueOf(quotation.getTotalAmount()))
                .tax(java.math.BigDecimal.ZERO)
                .discount(java.math.BigDecimal.ZERO)
                .total(java.math.BigDecimal.valueOf(quotation.getTotalAmount()))
                .changeAmount(java.math.BigDecimal.ZERO)
                .notes("Converted from Quotation #" + quotation.getId())
                .build();

        // Add sale items
        for (QuotationItem quotationItem : quotation.getItems()) {
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(quotationItem.getProduct());
            saleItem.setQuantity(quotationItem.getQuantity());
            saleItem.setUnitPrice(java.math.BigDecimal.valueOf(quotationItem.getUnitPrice()));
            sale.getItems().add(saleItem);
        }

        // Save sale
        saleRepository.save(sale);

        // Update quotation status
        quotation.setStatus(Quotation.QuotationStatus.CONVERTED);
        quotationRepository.save(quotation);

        return ApiResponse.builder()
                .success(true)
                .message("Quotation converted to sale successfully")
                .data(null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> searchQuotations(String searchTerm) {
        return quotationRepository.searchQuotations(searchTerm).stream()
                .map(QuotationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getQuotationsByCustomer(Long customerId) {
        return quotationRepository.findByCustomerId(customerId).stream()
                .map(QuotationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> getQuotationsByStatus(String status) {
        Quotation.QuotationStatus quotationStatus = Quotation.QuotationStatus.valueOf(status.toUpperCase());
        return quotationRepository.findByStatus(quotationStatus).stream()
                .map(QuotationResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateExpiredQuotations() {
        List<Quotation> expiredQuotations = quotationRepository.findExpiredQuotations(LocalDate.now());
        for (Quotation quotation : expiredQuotations) {
            quotation.setStatus(Quotation.QuotationStatus.EXPIRED);
        }
        quotationRepository.saveAll(expiredQuotations);
    }
}
