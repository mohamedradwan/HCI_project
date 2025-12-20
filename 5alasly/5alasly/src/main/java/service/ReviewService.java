package service;

import dto.ReviewDTO;
import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public Review createReview(Long reviewerId, ReviewDTO dto) {
        // Validate rating is between 1 and 5
        if (dto.getRating() == null || dto.getRating() < 1.0 || dto.getRating() > 5.0) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        ServiceRequest request = requestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));

        User ratedUser = userRepository.findById(dto.getRatedUserId())
                .orElseThrow(() -> new RuntimeException("Rated user not found"));

        if (request.getStatus() != ServiceRequest.RequestStatus.COMPLETED) {
            throw new RuntimeException("Can only review completed requests");
        }

        Review review = new Review();
        review.setServiceRequest(request);
        review.setReviewer(reviewer);
        review.setRatedUser(ratedUser);
        review.setRating(dto.getRating());
        review.setComment(dto.getComment());

        review = reviewRepository.save(review);

        // Update user's average rating
        userService.updateUserRating(ratedUser.getId());

        return review;
    }
}