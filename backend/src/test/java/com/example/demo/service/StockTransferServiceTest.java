package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Collections;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.demo.dto.StockTransferRequest;
import com.example.demo.entity.User;
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
        Authentication authentication = org.mockito.Mockito.mock(Authentication.class);
        SecurityContext securityContext = org.mockito.Mockito.mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("admin");
        SecurityContextHolder.setContext(securityContext);

        User user = new User();
        user.setId(1L);
        user.setUsername("admin");

        when(userRepository.findByUsername("admin")).thenReturn(java.util.Optional.of(user));

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
