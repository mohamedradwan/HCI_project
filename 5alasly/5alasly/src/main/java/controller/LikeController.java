package controller;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LikeController {

    private final RequestLikeRepository likeRepository;
    private final UserRepository userRepository;
    private final ServiceRequestRepository requestRepository;

    @PostMapping
    @Transactional
    public ResponseEntity<?> toggleLike(
            @RequestHeader("User-Id") Long userId,
            @RequestBody LikeDTO likeDTO) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            ServiceRequest request = requestRepository.findById(likeDTO.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            Optional<RequestLike> existing = likeRepository.findByUserIdAndServiceRequestId(userId,
                    likeDTO.getRequestId());

            if (existing.isPresent()) {
                RequestLike like = existing.get();
                if (like.getIsLike().equals(likeDTO.getIsLike())) {
                    // Same action - remove the like/dislike
                    likeRepository.delete(like);
                    return ResponseEntity.ok(Map.of("action", "removed"));
                } else {
                    // Different action - update
                    like.setIsLike(likeDTO.getIsLike());
                    likeRepository.save(like);
                    return ResponseEntity.ok(Map.of("action", "updated"));
                }
            } else {
                // Create new like/dislike
                RequestLike newLike = new RequestLike();
                newLike.setUser(user);
                newLike.setServiceRequest(request);
                newLike.setIsLike(likeDTO.getIsLike());
                likeRepository.save(newLike);
                return ResponseEntity.ok(Map.of("action", "created"));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getLikeStatus(
            @RequestHeader("User-Id") Long userId,
            @RequestParam Long requestId) {
        Optional<RequestLike> existing = likeRepository.findByUserIdAndServiceRequestId(userId, requestId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "liked", existing.get().getIsLike(),
                    "exists", true));
        }
        return ResponseEntity.ok(Map.of("exists", false));
    }

    public static class LikeDTO {
        private Long requestId;
        private Boolean isLike;

        public Long getRequestId() {
            return requestId;
        }

        public void setRequestId(Long requestId) {
            this.requestId = requestId;
        }

        public Boolean getIsLike() {
            return isLike;
        }

        public void setIsLike(Boolean isLike) {
            this.isLike = isLike;
        }
    }
}
