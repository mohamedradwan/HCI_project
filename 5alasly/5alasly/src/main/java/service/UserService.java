package service;

import dto.*;
import entity.User;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(hashPassword(request.getPassword()));

        user = userRepository.save(user);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "mock-jwt-token-" + user.getId(),
                "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "mock-jwt-token-" + user.getId(),
                "Login successful"
        );
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserStatsDTO getUserStats(Long userId) {
        User user = getUserById(userId);

        Integer completedTasks = taskAssignmentRepository.countCompletedTasksByUser(userId);
        Integer thisMonth = calculateThisMonthTasks(userId);

        return new UserStatsDTO(
                completedTasks,
                thisMonth,
                user.getActiveClients(),
                user.getRating()
        );
    }

    @Transactional
    public void updateUserRating(Long userId) {
        User user = getUserById(userId);
        Double avgRating = reviewRepository.calculateAverageRatingForUser(userId);
        Integer totalReviews = reviewRepository.countReviewsForUser(userId);

        if (avgRating != null) {
            user.setRating(avgRating);
            user.setTotalReviews(totalReviews);
            userRepository.save(user);
        }
    }

    private String hashPassword(String password) {
        // In production, use BCrypt or similar
        return "hashed_" + password;
    }

    private boolean verifyPassword(String rawPassword, String hashedPassword) {
        // In production, use BCrypt or similar
        return hashedPassword.equals("hashed_" + rawPassword);
    }

    private Integer calculateThisMonthTasks(Long userId) {
        // Simplified calculation - count tasks from current month
        return 8; // Mock value
    }
}