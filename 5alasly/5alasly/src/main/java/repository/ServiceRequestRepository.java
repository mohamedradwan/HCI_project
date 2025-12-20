package repository;

import entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStatus(ServiceRequest.RequestStatus status);

    List<ServiceRequest> findByUserId(Long userId);

    List<ServiceRequest> findByCategory(String category);

    List<ServiceRequest> findByUserIdAndStatus(Long userId, ServiceRequest.RequestStatus status);

    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.status = 'OPEN' ORDER BY sr.createdAt DESC")
    List<ServiceRequest> findAllOpenRequests();
}
