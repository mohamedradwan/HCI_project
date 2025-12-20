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
        user.setPaypalEmail(request.getPaypalEmail());
        user.setLatitude(request.getLatitude());
        user.setLongitude(request.getLongitude());
        user.setAddress(request.getAddress());

        user = userRepository.save(user);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                "mock-jwt-token-" + user.getId(),
                "Registration successful");
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
                "Login successful");
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
                user.getRating());
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

    @Transactional
    public User updateAvatar(Long userId, String avatarUrl) {
        User user = getUserById(userId);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        // Verify current password
        if (!verifyPassword(currentPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update to new password
        user.setPasswordHash(hashPassword(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void updatePayPalEmail(Long userId, String paypalEmail) {
        User user = getUserById(userId);
        user.setPaypalEmail(paypalEmail);
        userRepository.save(user);
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

    @Transactional
    public User updateAddress(Long userId, Double latitude, Double longitude, String address) {
        User user = getUserById(userId);
        user.setLatitude(latitude);
        user.setLongitude(longitude);
        user.setAddress(address);
        return userRepository.save(user);
    }

    // Haversine formula for calculating distance between two lat/lng points
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        if (lat1 == 0 || lon1 == 0 || lat2 == 0 || lon2 == 0) {
            return -1; // Invalid coordinates
        }

        final int R = 6371; // Radius of Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }
}
