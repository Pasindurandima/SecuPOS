package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.StockTransferRequest;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockTransferRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.DtoMapper;

@ExtendWith(MockitoExtension.class)
class StockTransferServiceTest {

    @Mock
    private StockTransferRepository stockTransferRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DtoMapper dtoMapper;

    @InjectMocks
    private StockTransferService stockTransferService;

    @Test
    void createStockTransfer_shouldRejectSameLocation() {
        StockTransferRequest request = StockTransferRequest.builder()
                .transferDate(LocalDateTime.now())
                .fromLocation("Main Warehouse")
                .toLocation("Main Warehouse")
                .status("PENDING")
                .notes("Same location")
                .items(Collections.emptyList())
                .build();

        assertThrows(BadRequestException.class, () -> stockTransferService.createStockTransfer(request));
    }
}
