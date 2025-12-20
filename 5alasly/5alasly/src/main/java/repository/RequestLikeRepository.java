package repository;

import entity.RequestLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface RequestLikeRepository extends JpaRepository<RequestLike, Long> {

    Optional<RequestLike> findByUserIdAndServiceRequestId(Long userId, Long requestId);

    @Query("SELECT COUNT(l) FROM RequestLike l WHERE l.serviceRequest.id = :requestId AND l.isLike = true")
    Long countLikesByRequestId(Long requestId);

    @Query("SELECT COUNT(l) FROM RequestLike l WHERE l.serviceRequest.id = :requestId AND l.isLike = false")
    Long countDislikesByRequestId(Long requestId);

    void deleteByUserIdAndServiceRequestId(Long userId, Long requestId);
}
