package repository;

import entity.ServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {
    List<ServiceOffering> findByUserId(Long userId);

    List<ServiceOffering> findByActiveTrue();

    List<ServiceOffering> findByActiveTrueAndCategory(String category);
}
