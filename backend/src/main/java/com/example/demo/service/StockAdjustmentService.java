package com.example.demo.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.StockAdjustmentItemRequest;
import com.example.demo.dto.StockAdjustmentRequest;
import com.example.demo.dto.StockAdjustmentResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.StockAdjustment;
import com.example.demo.entity.StockAdjustmentItem;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockAdjustmentRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockAdjustmentService {

    private final StockAdjustmentRepository stockAdjustmentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public StockAdjustmentResponse createStockAdjustment(StockAdjustmentRequest request) {
        validateRequest(request);

        String username = SecurityContextHolder.getContext().getAuthentication() != null
            ? SecurityContextHolder.getContext().getAuthentication().getName()
            : "system";
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StockAdjustment stockAdjustment = StockAdjustment.builder()
                .referenceNumber(generateReferenceNumber())
                .adjustmentDate(request.getAdjustmentDate())
                .location(request.getLocation())
            .adjustmentType(parseAdjustmentType(request.getAdjustmentType()))
            .reason(parseReason(request.getReason()))
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .totalQuantity(0)
                .user(user)
                .notes(request.getNotes())
                .documentPath(request.getDocumentPath())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (StockAdjustmentItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

                StockAdjustmentItem.ItemAdjustmentType itemAdjustmentType = parseItemAdjustmentType(itemRequest.getAdjustmentType());

            // Validate stock for SUBTRACT operations
            if (itemAdjustmentType == StockAdjustmentItem.ItemAdjustmentType.SUBTRACT) {
                if (product.getQuantity() < itemRequest.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product: " + product.getName() + 
                            ". Available: " + product.getQuantity() + ", Requested: " + itemRequest.getQuantity());
                }
            }

            BigDecimal subtotal = itemRequest.getUnitCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            // Create stock adjustment item
            StockAdjustmentItem adjustmentItem = StockAdjustmentItem.builder()
                    .stockAdjustment(stockAdjustment)
                    .product(product)
                    .adjustmentType(itemAdjustmentType)
                    .currentStock(product.getQuantity())
                    .quantity(itemRequest.getQuantity())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(subtotal)
                    .build();

            stockAdjustment.getItems().add(adjustmentItem);

            totalAmount = totalAmount.add(subtotal);
            totalQuantity += itemRequest.getQuantity();

            applyStockChange(product, itemAdjustmentType, itemRequest.getQuantity());
            productRepository.save(product);
        }

        // Set totals
        stockAdjustment.setTotalAmount(totalAmount);
        stockAdjustment.setTotalQuantity(totalQuantity);

        StockAdjustment savedAdjustment = stockAdjustmentRepository.save(stockAdjustment);
        return dtoMapper.toStockAdjustmentResponse(savedAdjustment);
    }

    @Transactional(readOnly = true)
    public StockAdjustmentResponse getStockAdjustment(Long id) {
        StockAdjustment stockAdjustment = stockAdjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found with id: " + id));
        ensureActive(stockAdjustment);
        return dtoMapper.toStockAdjustmentResponse(stockAdjustment);
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentResponse> getAllStockAdjustments() {
        return stockAdjustmentRepository.findAllActive().stream()
                .map(dtoMapper::toStockAdjustmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentResponse> getStockAdjustmentsByLocation(String location) {
        return stockAdjustmentRepository.findByLocation(location).stream()
                .map(dtoMapper::toStockAdjustmentResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockAdjustmentResponse updateStockAdjustment(Long id, StockAdjustmentRequest request) {
        StockAdjustment stockAdjustment = stockAdjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found with id: " + id));
        ensureActive(stockAdjustment);
        validateRequest(request);

        // Revert previous stock changes
        for (StockAdjustmentItem item : stockAdjustment.getItems()) {
            Product product = item.getProduct();
            if (item.getAdjustmentType() == StockAdjustmentItem.ItemAdjustmentType.ADD) {
                product.setQuantity(product.getQuantity() - item.getQuantity());
            } else {
                product.setQuantity(product.getQuantity() + item.getQuantity());
            }
            productRepository.save(product);
        }

        stockAdjustment.getItems().clear();

        // Update stock adjustment details
        stockAdjustment.setAdjustmentDate(request.getAdjustmentDate());
        stockAdjustment.setLocation(request.getLocation());
        stockAdjustment.setAdjustmentType(parseAdjustmentType(request.getAdjustmentType()));
        stockAdjustment.setReason(parseReason(request.getReason()));
        stockAdjustment.setNotes(request.getNotes());
        stockAdjustment.setDocumentPath(request.getDocumentPath());

        // Process new items
        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (StockAdjustmentItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

                StockAdjustmentItem.ItemAdjustmentType itemAdjustmentType = parseItemAdjustmentType(itemRequest.getAdjustmentType());

            // Validate stock for SUBTRACT operations
            if (itemAdjustmentType == StockAdjustmentItem.ItemAdjustmentType.SUBTRACT) {
                if (product.getQuantity() < itemRequest.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for product: " + product.getName() + 
                            ". Available: " + product.getQuantity() + ", Requested: " + itemRequest.getQuantity());
                }
            }

            // Calculate subtotal
            BigDecimal subtotal = itemRequest.getUnitCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            // Create stock adjustment item
            StockAdjustmentItem adjustmentItem = StockAdjustmentItem.builder()
                    .stockAdjustment(stockAdjustment)
                    .product(product)
                    .adjustmentType(itemAdjustmentType)
                    .currentStock(product.getQuantity())
                    .quantity(itemRequest.getQuantity())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(subtotal)
                    .build();

            stockAdjustment.getItems().add(adjustmentItem);

            totalAmount = totalAmount.add(subtotal);
            totalQuantity += itemRequest.getQuantity();

            applyStockChange(product, itemAdjustmentType, itemRequest.getQuantity());
            productRepository.save(product);
        }

        // Set totals
        stockAdjustment.setTotalAmount(totalAmount);
        stockAdjustment.setTotalQuantity(totalQuantity);

        StockAdjustment updatedAdjustment = stockAdjustmentRepository.save(stockAdjustment);
        return dtoMapper.toStockAdjustmentResponse(updatedAdjustment);
    }

    @Transactional
    public void deleteStockAdjustment(Long id) {
        StockAdjustment stockAdjustment = stockAdjustmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock adjustment not found with id: " + id));
        ensureActive(stockAdjustment);

        // Revert stock changes
        for (StockAdjustmentItem item : stockAdjustment.getItems()) {
            Product product = item.getProduct();
            if (item.getAdjustmentType() == StockAdjustmentItem.ItemAdjustmentType.ADD) {
                product.setQuantity(product.getQuantity() - item.getQuantity());
            } else {
                product.setQuantity(product.getQuantity() + item.getQuantity());
            }
            productRepository.save(product);
        }

        // Soft delete
        stockAdjustment.setIsActive(false);
        stockAdjustmentRepository.save(stockAdjustment);
    }

    private String generateReferenceNumber() {
        Integer maxNumber = stockAdjustmentRepository.findMaxReferenceNumber();
        int nextNumber = (maxNumber != null ? maxNumber : 0) + 1;
        return String.format("SA-%04d", nextNumber);
    }

    private void validateRequest(StockAdjustmentRequest request) {
        parseAdjustmentType(request.getAdjustmentType());
        parseReason(request.getReason());

        Set<Long> productIds = new HashSet<>();
        for (StockAdjustmentItemRequest item : request.getItems()) {
            parseItemAdjustmentType(item.getAdjustmentType());
            if (!productIds.add(item.getProductId())) {
                throw new BadRequestException("A product can only be included once in an adjustment");
            }
            if (item.getQuantity() == null || item.getQuantity() < 1) {
                throw new BadRequestException("Adjustment quantity must be at least 1");
            }
            if (item.getUnitCost() == null || item.getUnitCost().signum() < 0) {
                throw new BadRequestException("Unit cost cannot be negative");
            }
        }
    }

    private StockAdjustment.AdjustmentType parseAdjustmentType(String value) {
        try {
            return StockAdjustment.AdjustmentType.valueOf(value.toUpperCase());
        } catch (RuntimeException ex) {
            throw new BadRequestException("Unsupported adjustment type: " + value);
        }
    }

    private StockAdjustment.AdjustmentReason parseReason(String value) {
        try {
            return StockAdjustment.AdjustmentReason.valueOf(value.toUpperCase());
        } catch (RuntimeException ex) {
            throw new BadRequestException("Unsupported adjustment reason: " + value);
        }
    }

    private StockAdjustmentItem.ItemAdjustmentType parseItemAdjustmentType(String value) {
        try {
            return StockAdjustmentItem.ItemAdjustmentType.valueOf(value.toUpperCase());
        } catch (RuntimeException ex) {
            throw new BadRequestException("Unsupported item adjustment type: " + value);
        }
    }

    private void applyStockChange(Product product, StockAdjustmentItem.ItemAdjustmentType type, int quantity) {
        int currentQuantity;
        if (product.getQuantity() == null) {
            currentQuantity = 0;
        } else {
            currentQuantity = product.getQuantity().intValue();
        }
        if (type == StockAdjustmentItem.ItemAdjustmentType.ADD) {
            product.setQuantity(currentQuantity + quantity);
        } else {
            product.setQuantity(currentQuantity - quantity);
        }
    }

    private void ensureActive(StockAdjustment stockAdjustment) {
        if (!Boolean.TRUE.equals(stockAdjustment.getIsActive())) {
            throw new ResourceNotFoundException("Stock adjustment not found with id: " + stockAdjustment.getId());
        }
    }
}
