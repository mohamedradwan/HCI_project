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
    private final RequestLikeRepository requestLikeRepository;

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

    @Transactional
    public ServiceRequestDTO markAsPaid(Long requestId, String paypalOrderId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (request.getStatus() != ServiceRequest.RequestStatus.COMPLETED) {
            throw new RuntimeException("Only completed tasks can be marked as paid");
        }

        request.setStatus(ServiceRequest.RequestStatus.PAID);
        requestRepository.save(request);

        return convertToDTO(request);
    }

    @Transactional
    public ServiceRequestDTO cancelRequest(Long requestId, Long userId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only allow owner to cancel
        if (!request.getUser().getId().equals(userId)) {
            throw new RuntimeException("Only the request owner can cancel");
        }

        if (request.getStatus() == ServiceRequest.RequestStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed request");
        }

        request.setStatus(ServiceRequest.RequestStatus.CANCELLED);
        requestRepository.save(request);

        return convertToDTO(request);
    }

    // Get requests CREATED BY this user that are completed (including PAID)
    public List<ServiceRequestDTO> getCompletedRequestsByUser(Long userId) {
        List<ServiceRequest> completed = requestRepository.findByUserIdAndStatus(userId,
                ServiceRequest.RequestStatus.COMPLETED);
        List<ServiceRequest> paid = requestRepository.findByUserIdAndStatus(userId, ServiceRequest.RequestStatus.PAID);
        completed.addAll(paid);
        return completed.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get requests CREATED BY this user that are in progress
    public List<ServiceRequestDTO> getInProgressRequestsByUser(Long userId) {
        return requestRepository.findByUserIdAndStatus(userId, ServiceRequest.RequestStatus.IN_PROGRESS)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get tasks where this user is the HELPER (accepted tasks)
    public List<ServiceRequestDTO> getAcceptedTasksByHelper(Long helperUserId) {
        return taskAssignmentRepository.findByHelperUserId(helperUserId)
                .stream()
                .filter(ta -> ta.getCompletedAt() == null) // Only in-progress (not completed)
                .map(ta -> convertToDTO(ta.getServiceRequest()))
                .collect(Collectors.toList());
    }

    // Get completed tasks where this user was the HELPER
    public List<ServiceRequestDTO> getCompletedTasksByHelper(Long helperUserId) {
        return taskAssignmentRepository.findByHelperUserId(helperUserId)
                .stream()
                .filter(ta -> ta.getCompletedAt() != null) // Only completed
                .map(ta -> convertToDTO(ta.getServiceRequest()))
                .collect(Collectors.toList());
    }

    private ServiceRequestDTO convertToDTO(ServiceRequest request) {
        User user = request.getUser();
        // Use actual avatar URL if available, otherwise use initials
        String avatar = user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()
                ? user.getAvatarUrl()
                : user.getName().substring(0, Math.min(2, user.getName().length())).toUpperCase();

        long hours = ChronoUnit.HOURS.between(request.getCreatedAt(), LocalDateTime.now());
        String timeAgo = hours < 24 ? hours + " hours ago" : (hours / 24) + " days ago";

        // Get helper info if assigned
        Long helperId = null;
        String helperName = null;
        String helperAvatar = null;
        Double helperRating = null;

        var assignment = taskAssignmentRepository.findByServiceRequestId(request.getId());
        if (assignment.isPresent()) {
            User helper = assignment.get().getHelperUser();
            helperId = helper.getId();
            helperName = helper.getName();
            helperAvatar = helper.getAvatarUrl() != null && !helper.getAvatarUrl().isEmpty()
                    ? helper.getAvatarUrl()
                    : helper.getName().substring(0, Math.min(2, helper.getName().length())).toUpperCase();
            helperRating = helper.getRating();
        }

        // Get like counts
        Long likeCount = requestLikeRepository.countLikesByRequestId(request.getId());
        Long dislikeCount = requestLikeRepository.countDislikesByRequestId(request.getId());

        ServiceRequestDTO dto = new ServiceRequestDTO();
        dto.setId(request.getId());
        dto.setTitle(request.getTitle());
        dto.setCategory(request.getCategory());
        dto.setDescription(request.getDescription());
        dto.setBudget(request.getBudget());
        dto.setLocation(request.getLocation());
        dto.setDate(request.getDate());
        dto.setTime(request.getTime());
        dto.setUserId(user.getId());
        dto.setUserName(user.getName());
        dto.setUserAvatar(avatar);
        dto.setUserRating(user.getRating());
        dto.setStatus(request.getStatus().name());
        dto.setUrgent(request.getUrgent());
        dto.setDistance("1.2 km");
        dto.setTimeAgo(timeAgo);
        dto.setLatitude(request.getLatitude());
        dto.setLongitude(request.getLongitude());
        dto.setHelperId(helperId);
        dto.setHelperName(helperName);
        dto.setHelperAvatar(helperAvatar);
        dto.setHelperRating(helperRating);
        dto.setLikeCount(likeCount != null ? likeCount : 0L);
        dto.setDislikeCount(dislikeCount != null ? dislikeCount : 0L);

        return dto;
    }
}