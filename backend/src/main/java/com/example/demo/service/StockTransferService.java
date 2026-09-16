package com.example.demo.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.StockTransferItemRequest;
import com.example.demo.dto.StockTransferRequest;
import com.example.demo.dto.StockTransferResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.StockTransfer;
import com.example.demo.entity.StockTransferItem;
import com.example.demo.entity.User;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockTransferRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DtoMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StockTransferService {

    private final StockTransferRepository stockTransferRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DtoMapper dtoMapper;

    @Transactional
    public StockTransferResponse createStockTransfer(StockTransferRequest request) {
        validateTransfer(request);

        String username = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : "system";

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StockTransfer stockTransfer = StockTransfer.builder()
                .transferNumber(generateTransferNumber())
                .transferDate(request.getTransferDate())
                .fromLocation(request.getFromLocation())
                .toLocation(request.getToLocation())
                .status(StockTransfer.TransferStatus.valueOf(request.getStatus() == null ? "PENDING" : request.getStatus().toUpperCase()))
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .totalQuantity(0)
                .user(user)
                .notes(request.getNotes())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (StockTransferItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getQuantity() + ", Requested: " + itemRequest.getQuantity());
            }

            BigDecimal subtotal = itemRequest.getUnitCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            StockTransferItem item = StockTransferItem.builder()
                    .stockTransfer(stockTransfer)
                    .product(product)
                    .currentStock(product.getQuantity())
                    .quantity(itemRequest.getQuantity())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(subtotal)
                    .build();

            stockTransfer.getItems().add(item);
            totalAmount = totalAmount.add(subtotal);
            totalQuantity += itemRequest.getQuantity();

            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        stockTransfer.setTotalAmount(totalAmount);
        stockTransfer.setTotalQuantity(totalQuantity);

        if ("COMPLETED".equalsIgnoreCase(request.getStatus())) {
            stockTransfer.setStatus(StockTransfer.TransferStatus.COMPLETED);
        } else if ("IN_TRANSIT".equalsIgnoreCase(request.getStatus())) {
            stockTransfer.setStatus(StockTransfer.TransferStatus.IN_TRANSIT);
        } else if ("CANCELLED".equalsIgnoreCase(request.getStatus())) {
            stockTransfer.setStatus(StockTransfer.TransferStatus.CANCELLED);
        } else {
            stockTransfer.setStatus(StockTransfer.TransferStatus.PENDING);
        }

        StockTransfer savedTransfer = stockTransferRepository.save(stockTransfer);
        return dtoMapper.toStockTransferResponse(savedTransfer);
    }

    @Transactional(readOnly = true)
    public List<StockTransferResponse> getAllStockTransfers() {
        return stockTransferRepository.findAllActive().stream()
                .map(dtoMapper::toStockTransferResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StockTransferResponse getStockTransfer(Long id) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found with id: " + id));
        return dtoMapper.toStockTransferResponse(transfer);
    }

    @Transactional
    public StockTransferResponse updateStockTransfer(Long id, StockTransferRequest request) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found with id: " + id));

        validateTransfer(request);

        for (StockTransferItem item : transfer.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        transfer.getItems().clear();
        transfer.setTransferDate(request.getTransferDate());
        transfer.setFromLocation(request.getFromLocation());
        transfer.setToLocation(request.getToLocation());
        transfer.setNotes(request.getNotes());
        transfer.setStatus(resolveStatus(request.getStatus()));

        BigDecimal totalAmount = BigDecimal.ZERO;
        int totalQuantity = 0;

        for (StockTransferItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemRequest.getProductId()));

            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + ". Available: " + product.getQuantity() + ", Requested: " + itemRequest.getQuantity());
            }

            BigDecimal subtotal = itemRequest.getUnitCost().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            StockTransferItem item = StockTransferItem.builder()
                    .stockTransfer(transfer)
                    .product(product)
                    .currentStock(product.getQuantity())
                    .quantity(itemRequest.getQuantity())
                    .unitCost(itemRequest.getUnitCost())
                    .subtotal(subtotal)
                    .build();

            transfer.getItems().add(item);
            totalAmount = totalAmount.add(subtotal);
            totalQuantity += itemRequest.getQuantity();

            product.setQuantity(product.getQuantity() - itemRequest.getQuantity());
            productRepository.save(product);
        }

        transfer.setTotalAmount(totalAmount);
        transfer.setTotalQuantity(totalQuantity);

        return dtoMapper.toStockTransferResponse(stockTransferRepository.save(transfer));
    }

    @Transactional
    public void deleteStockTransfer(Long id) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Stock transfer not found with id: " + id));

        for (StockTransferItem item : transfer.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        transfer.setIsActive(false);
        stockTransferRepository.save(transfer);
    }

    private void validateTransfer(StockTransferRequest request) {
        if (request.getFromLocation() == null || request.getFromLocation().isBlank()) {
            throw new BadRequestException("From location is required");
        }
        if (request.getToLocation() == null || request.getToLocation().isBlank()) {
            throw new BadRequestException("To location is required");
        }
        if (request.getFromLocation().equalsIgnoreCase(request.getToLocation())) {
            throw new BadRequestException("Source and destination locations must be different");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Transfer must include at least one item");
        }
    }

    private StockTransfer.TransferStatus resolveStatus(String status) {
        if (status == null || status.isBlank()) {
            return StockTransfer.TransferStatus.PENDING;
        }
        try {
            return StockTransfer.TransferStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported stock transfer status: " + status);
        }
    }

    private String generateTransferNumber() {
        Integer maxNumber = stockTransferRepository.findMaxTransferNumber();
        int next = (maxNumber == null ? 0 : maxNumber) + 1;
        return String.format("ST-%04d", next);
    }
}
