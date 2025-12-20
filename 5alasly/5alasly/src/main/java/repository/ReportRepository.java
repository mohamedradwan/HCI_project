package repository;

import entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByServiceRequestId(Long requestId);

    List<Report> findByReporterId(Long userId);

    List<Report> findByStatus(String status);

    boolean existsByReporterIdAndServiceRequestId(Long reporterId, Long requestId);
}
