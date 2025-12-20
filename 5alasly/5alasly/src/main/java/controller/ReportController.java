package controller;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReportController {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository requestRepository;

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestHeader("User-Id") Long userId,
            @RequestBody ReportDTO reportDTO) {
        try {
            // Check if already reported
            if (reportRepository.existsByReporterIdAndServiceRequestId(userId, reportDTO.getRequestId())) {
                return ResponseEntity.badRequest().body(Map.of("error", "You have already reported this task"));
            }

            User reporter = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ServiceRequest request = requestRepository.findById(reportDTO.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            Report report = new Report();
            report.setReporter(reporter);
            report.setServiceRequest(request);
            report.setReason(reportDTO.getReason());
            report.setDetails(reportDTO.getDetails());

            reportRepository.save(report);

            return ResponseEntity.ok(Map.of("message", "Report submitted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    public static class ReportDTO {
        private Long requestId;
        private String reason;
        private String details;

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDetails() {
            return details;
        }

        public void setDetails(String details) {
            this.details = details;
        }
    }
}
