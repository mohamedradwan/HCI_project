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
}