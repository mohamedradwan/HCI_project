package entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(nullable = false)
    private Integer totalReviews = 0;

    @Column(nullable = false)
    private Integer completedTasks = 0;

    @Column(nullable = false)
    private Integer activeClients = 0;

    @Column(nullable = false)
    private Boolean verified = false;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "paypal_email")
    private String paypalEmail;

    @Column(columnDefinition = "TEXT")
    private String badges; // Comma-separated badges: "Top Helper,Verified,Fast Responder"

    // User location for distance calculation
    private Double latitude;
    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}