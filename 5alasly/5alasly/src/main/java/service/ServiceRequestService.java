package service;


import dto.*;
import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;

    @Transactional
    public ServiceRequestDTO createRequest(Long userId, CreateRequestDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceRequest request = new ServiceRequest();
        request.setTitle(dto.getTitle());
        request.setCategory(dto.getCategory());
        request.setDescription(dto.getDescription());
        request.setBudget(dto.getBudget());
        request.setLocation(dto.getLocation());
        request.setDate(dto.getDate());
        request.setTime(dto.getTime());
        request.setUser(user);
        request.setUrgent(dto.getUrgent() != null ? dto.getUrgent() : false);

        request = requestRepository.save(request);

        return convertToDTO(request);
    }

    public List<ServiceRequestDTO> getAllOpenRequests() {
        return requestRepository.findAllOpenRequests()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestDTO> getRequestsByUser(Long userId) {
        return requestRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceRequestDTO> getRequestsByCategory(String category) {
        return requestRepository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ServiceRequestDTO getRequestById(Long id) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return convertToDTO(request);
    }

    @Transactional
    public ServiceRequestDTO acceptRequest(Long requestId, Long helperUserId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        User helper = userRepository.findById(helperUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getStatus() != ServiceRequest.RequestStatus.OPEN) {
            throw new RuntimeException("Request is not available");
        }

        request.setStatus(ServiceRequest.RequestStatus.IN_PROGRESS);
        requestRepository.save(request);

        TaskAssignment assignment = new TaskAssignment();
        assignment.setServiceRequest(request);
        assignment.setHelperUser(helper);
        taskAssignmentRepository.save(assignment);

        return convertToDTO(request);
    }

    @Transactional
    public ServiceRequestDTO completeRequest(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(ServiceRequest.RequestStatus.COMPLETED);
        requestRepository.save(request);

        TaskAssignment assignment = taskAssignmentRepository.findByServiceRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setCompletedAt(LocalDateTime.now());
        taskAssignmentRepository.save(assignment);

        return convertToDTO(request);
    }

    private ServiceRequestDTO convertToDTO(ServiceRequest request) {
        User user = request.getUser();
        String avatar = user.getName().substring(0, Math.min(2, user.getName().length())).toUpperCase();

        long hours = ChronoUnit.HOURS.between(request.getCreatedAt(), LocalDateTime.now());
        String timeAgo = hours < 24 ? hours + " hours ago" : (hours / 24) + " days ago";

        return new ServiceRequestDTO(
                request.getId(),
                request.getTitle(),
                request.getCategory(),
                request.getDescription(),
                request.getBudget(),
                request.getLocation(),
                request.getDate(),
                request.getTime(),
                user.getId(),
                user.getName(),
                avatar,
                user.getRating(),
                request.getStatus().name(),
                request.getUrgent(),
                "1.2 km", // Mock distance
                timeAgo
        );
    }
}