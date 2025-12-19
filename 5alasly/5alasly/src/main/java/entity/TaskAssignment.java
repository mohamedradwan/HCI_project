package entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "task_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private ServiceRequest serviceRequest;

    @ManyToOne
    @JoinColumn(name = "helper_user_id", nullable = false)
    private User helperUser;

    @Column(nullable = false, updatable = false)
    private LocalDateTime acceptedAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        acceptedAt = LocalDateTime.now();
    }
}