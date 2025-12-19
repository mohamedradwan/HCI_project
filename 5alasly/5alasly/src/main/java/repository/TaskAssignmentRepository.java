package repository;

import entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {
    Optional<TaskAssignment> findByServiceRequestId(Long requestId);
    List<TaskAssignment> findByHelperUserId(Long helperUserId);

    @Query("SELECT COUNT(ta) FROM TaskAssignment ta WHERE ta.helperUser.id = :userId AND ta.completedAt IS NOT NULL")
    Integer countCompletedTasksByUser(Long userId);
}
