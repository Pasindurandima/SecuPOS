package com.example.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.NotificationTemplateDTO;
import com.example.demo.entity.NotificationTemplate;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.NotificationTemplateRepository;
import com.example.demo.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationTemplateService {
    private final NotificationTemplateRepository repository;
    private final UserRepository userRepository;

    @Transactional
    public List<NotificationTemplateDTO> list(Long userId) {
        if (!repository.existsByUserId(userId)) seed(userId);
        return repository.findByUserIdOrderByCategoryAscNameAsc(userId).stream().map(this::toDto).toList();
    }

    @Transactional
    public NotificationTemplateDTO save(Long userId, NotificationTemplateDTO dto) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        NotificationTemplate template = dto.getId() == null ? new NotificationTemplate() : repository.findById(dto.getId()).filter(item -> item.getUser().getId().equals(userId)).orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        template.setUser(user); template.setCategory(dto.getCategory()); template.setNotificationType(dto.getNotificationType()); template.setName(dto.getName()); template.setTriggerEvent(dto.getTriggerEvent()); template.setSubject(dto.getSubject()); template.setMessage(dto.getMessage()); template.setActive(dto.getActive() == null || dto.getActive());
        return toDto(repository.save(template));
    }

    @Transactional
    public void delete(Long userId, Long id) {
        NotificationTemplate template = repository.findById(id).filter(item -> item.getUser().getId().equals(userId)).orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        repository.delete(template);
    }

    private NotificationTemplateDTO toDto(NotificationTemplate item) { NotificationTemplateDTO dto = new NotificationTemplateDTO(); dto.setId(item.getId()); dto.setCategory(item.getCategory()); dto.setNotificationType(item.getNotificationType()); dto.setName(item.getName()); dto.setTriggerEvent(item.getTriggerEvent()); dto.setSubject(item.getSubject()); dto.setMessage(item.getMessage()); dto.setActive(item.getActive()); return dto; }

    private void seed(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Map<String, String>> defaults = List.of(
            Map.of("category", "order", "type", "email", "name", "Order Confirmation", "trigger", "sale.completed", "subject", "Your order #{order_number} has been confirmed", "message", "Dear {customer_name}, your order #{order_number} totaling {order_total} has been confirmed."),
            Map.of("category", "payment", "type", "email", "name", "Payment Received", "trigger", "payment.received", "subject", "Payment confirmation for {payment_amount}", "message", "We received your payment of {payment_amount} via {payment_method}."),
            Map.of("category", "shipment", "type", "email", "name", "Shipment Created", "trigger", "shipment.created", "subject", "Your order is being prepared", "message", "Your order #{order_number} is being prepared for shipment."),
            Map.of("category", "stock", "type", "email", "name", "Low Stock Alert", "trigger", "inventory.low_stock", "subject", "Low stock alert: {product_name}", "message", "{product_name} is running low. Current stock: {current_stock}. Minimum required: {min_stock}."),
            Map.of("category", "welcome", "type", "email", "name", "New Customer Welcome", "trigger", "customer.created", "subject", "Welcome to {business_name}", "message", "Welcome {customer_name}! We are happy to have you."),
            Map.of("category", "password", "type", "email", "name", "Password Changed", "trigger", "password.changed", "subject", "Your password has been changed", "message", "Your password was successfully changed.")
        );
        defaults.forEach(item -> { NotificationTemplate template = new NotificationTemplate(); template.setUser(user); template.setCategory(item.get("category")); template.setNotificationType(item.get("type")); template.setName(item.get("name")); template.setTriggerEvent(item.get("trigger")); template.setSubject(item.get("subject")); template.setMessage(item.get("message")); template.setActive(true); repository.save(template); });
    }
}