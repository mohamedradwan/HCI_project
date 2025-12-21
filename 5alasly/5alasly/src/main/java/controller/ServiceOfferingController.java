package controller;

import dto.*;
import service.ServiceOfferingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/offerings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ServiceOfferingController {

    private final ServiceOfferingService offeringService;

    @PostMapping("/user/{userId}")
    public ResponseEntity<ServiceOfferingDTO> createOffering(
            @PathVariable Long userId,
            @RequestBody CreateServiceOfferingDTO dto) {
        return ResponseEntity.ok(offeringService.createOffering(userId, dto));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ServiceOfferingDTO>> getOfferingsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(offeringService.getOfferingsByUser(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ServiceOfferingDTO>> getAllActiveOfferings() {
        return ResponseEntity.ok(offeringService.getAllActiveOfferings());
    }

    @DeleteMapping("/{id}/user/{userId}")
    public ResponseEntity<Void> deleteOffering(@PathVariable Long id, @PathVariable Long userId) {
        offeringService.deleteOffering(id, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<ProviderStatsDTO> getProviderStats(@PathVariable Long userId) {
        return ResponseEntity.ok(offeringService.getProviderStats(userId));
    }
}
