package controller;

import dto.*;
import service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO> createRequest(
            @RequestHeader("User-Id") Long userId,
            @RequestBody CreateRequestDTO request) {
        try {
            ServiceRequestDTO response = requestService.createRequest(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO>> getAllOpenRequests() {
        List<ServiceRequestDTO> requests = requestService.getAllOpenRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO> getRequestById(@PathVariable Long id) {
        try {
            ServiceRequestDTO request = requestService.getRequestById(id);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceRequestDTO>> getRequestsByUser(@PathVariable Long userId) {
        List<ServiceRequestDTO> requests = requestService.getRequestsByUser(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ServiceRequestDTO>> getRequestsByCategory(@PathVariable String category) {
        List<ServiceRequestDTO> requests = requestService.getRequestsByCategory(category);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<ServiceRequestDTO> acceptRequest(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        try {
            ServiceRequestDTO response = requestService.acceptRequest(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ServiceRequestDTO> completeRequest(@PathVariable Long id) {
        try {
            ServiceRequestDTO response = requestService.completeRequest(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ServiceRequestDTO> cancelRequest(
            @PathVariable Long id,
            @RequestHeader("User-Id") Long userId) {
        try {
            ServiceRequestDTO response = requestService.cancelRequest(id, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<List<ServiceRequestDTO>> getCompletedRequestsByUser(@PathVariable Long userId) {
        List<ServiceRequestDTO> requests = requestService.getCompletedRequestsByUser(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/user/{userId}/in-progress")
    public ResponseEntity<List<ServiceRequestDTO>> getInProgressRequestsByUser(@PathVariable Long userId) {
        List<ServiceRequestDTO> requests = requestService.getInProgressRequestsByUser(userId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/helper/{helperId}/accepted")
    public ResponseEntity<List<ServiceRequestDTO>> getAcceptedTasksByHelper(@PathVariable Long helperId) {
        List<ServiceRequestDTO> requests = requestService.getAcceptedTasksByHelper(helperId);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/helper/{helperId}/completed")
    public ResponseEntity<List<ServiceRequestDTO>> getCompletedTasksByHelper(@PathVariable Long helperId) {
        List<ServiceRequestDTO> requests = requestService.getCompletedTasksByHelper(helperId);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<?> markAsPaid(
            @PathVariable Long id,
            @RequestBody(required = false) PaymentDTO payment) {
        try {
            ServiceRequestDTO request = requestService.markAsPaid(id, payment != null ? payment.getOrderId() : null);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/search")
    public ResponseEntity<List<ServiceRequestDTO>> searchWithFilters(@RequestBody SearchFiltersDTO filters) {
        List<ServiceRequestDTO> requests = requestService.searchWithFilters(filters);
        return ResponseEntity.ok(requests);
    }

    // DTO for payment info
    public static class PaymentDTO {
        private String orderId;

        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }
    }
}