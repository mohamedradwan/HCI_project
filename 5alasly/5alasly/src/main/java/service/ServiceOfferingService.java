package service;

import dto.*;
import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceOfferingService {

    private final ServiceOfferingRepository offeringRepository;
    private final UserRepository userRepository;
    private final TaskAssignmentRepository assignmentRepository;

    @Transactional
    public ServiceOfferingDTO createOffering(Long userId, CreateServiceOfferingDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceOffering offering = new ServiceOffering();
        offering.setUser(user);
        offering.setTitle(dto.getTitle());
        offering.setCategory(dto.getCategory());
        offering.setDescription(dto.getDescription());
        offering.setPrice(dto.getPrice());
        offering.setActive(true);

        offering = offeringRepository.save(offering);
        return convertToDTO(offering);
    }

    public List<ServiceOfferingDTO> getOfferingsByUser(Long userId) {
        return offeringRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceOfferingDTO> getAllActiveOfferings() {
        return offeringRepository.findByActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteOffering(Long id, Long userId) {
        ServiceOffering offering = offeringRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offering not found"));

        if (!offering.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this offering");
        }

        offeringRepository.delete(offering);
    }

    public ProviderStatsDTO getProviderStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ServiceOffering> offerings = offeringRepository.findByUserId(userId);
        Integer activeServices = (int) offerings.stream().filter(ServiceOffering::getActive).count();

        // Mocking some stats for now as we don't have a full payment/task system for
        // offerings yet
        Integer completedTasks = assignmentRepository.countCompletedTasksByUser(userId);

        // Earnings History (Last 6 Months)
        Map<String, Double> earningsHistory = new HashMap<>();
        earningsHistory.put("Jul", 450.0);
        earningsHistory.put("Aug", 780.0);
        earningsHistory.put("Sep", 620.0);
        earningsHistory.put("Oct", 950.0);
        earningsHistory.put("Nov", 1120.0);
        earningsHistory.put("Dec", 1450.0);

        // Category Stats
        Map<String, Integer> categoryStats = new HashMap<>();
        for (ServiceOffering offering : offerings) {
            categoryStats.merge(offering.getCategory(), 1, Integer::sum);
        }
        // Fallback for empty
        if (categoryStats.isEmpty()) {
            categoryStats.put("Tutoring", 2);
            categoryStats.put("Home Repairs", 1);
        }

        return new ProviderStatsDTO(
                activeServices,
                completedTasks * 150.0 + 4870.0, // Mock total earnings
                user.getRating(),
                user.getTotalReviews() + 15,
                completedTasks,
                earningsHistory,
                categoryStats);
    }

    private ServiceOfferingDTO convertToDTO(ServiceOffering offering) {
        return new ServiceOfferingDTO(
                offering.getId(),
                offering.getUser().getId(),
                offering.getUser().getName(),
                offering.getUser().getAvatarUrl(),
                offering.getTitle(),
                offering.getCategory(),
                offering.getDescription(),
                offering.getPrice(),
                offering.getActive(),
                offering.getCreatedAt());
    }
}
