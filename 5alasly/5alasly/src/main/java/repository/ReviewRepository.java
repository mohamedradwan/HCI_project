package repository;

import entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRatedUserId(Long ratedUserId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.ratedUser.id = :userId")
    Double calculateAverageRatingForUser(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.ratedUser.id = :userId")
    Integer countReviewsForUser(Long userId);
}