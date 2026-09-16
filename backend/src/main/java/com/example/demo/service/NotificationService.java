package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository repository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional
    public List<Notification> list(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        productRepository.findLowStockProducts().forEach(product -> {
            String reference = "LOW_STOCK:" + product.getId();
            if (repository.findByUserIdAndReference(userId, reference).isEmpty()) {
                Notification notification = new Notification(); notification.setUser(user); notification.setType("inventory"); notification.setTitle("Low stock alert"); notification.setMessage(product.getName() + " is running low. Current stock: " + product.getQuantity() + "."); notification.setReference(reference); notification.setRead(false); repository.save(notification);
            }
        });
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional public void markRead(Long userId, Long id) { repository.findByIdAndUserId(id, userId).ifPresent(item -> { item.setRead(true); repository.save(item); }); }
    @Transactional public void markAllRead(Long userId) { repository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).forEach(item -> item.setRead(true)); }
    @Transactional public void delete(Long userId, Long id) { repository.findByIdAndUserId(id, userId).ifPresent(repository::delete); }
    @Transactional(readOnly = true) public long count(Long userId) { return repository.countByUserIdAndReadFalse(userId); }
}