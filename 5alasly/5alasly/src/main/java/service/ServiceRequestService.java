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
    private final NotificationService notificationService;

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

        // Create notification for request owner
        notificationService.createNotification(
                request.getUser().getId(),
                Notification.NotificationType.REQUEST_ACCEPTED,
                "Request Accepted",
                helper.getName() + " accepted your request: " + request.getTitle(),
                requestId,
                helperUserId);

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

        // Notify request owner
        notificationService.createNotification(
                request.getUser().getId(),
                Notification.NotificationType.REQUEST_COMPLETED,
                "Request Completed",
                "Your request \"" + request.getTitle() + "\" has been completed!",
                requestId,
                assignment.getHelperUser().getId());

        // Notify helper
        notificationService.createNotification(
                assignment.getHelperUser().getId(),
                Notification.NotificationType.REQUEST_COMPLETED,
                "Task Completed",
                "You completed: " + request.getTitle(),
                requestId,
                request.getUser().getId());

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

        // Notify helper if request was accepted
        var assignment = taskAssignmentRepository.findByServiceRequestId(requestId);
        if (assignment.isPresent()) {
            notificationService.createNotification(
                    assignment.get().getHelperUser().getId(),
                    Notification.NotificationType.REQUEST_CANCELLED,
                    "Request Cancelled",
                    "The request \"" + request.getTitle() + "\" has been cancelled by the client",
                    requestId,
                    userId);
        }

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

    // Advanced search with filters
    public List<ServiceRequestDTO> searchWithFilters(SearchFiltersDTO filters) {
        List<ServiceRequest> allRequests = requestRepository.findAllOpenRequests();

        return allRequests.stream()
                .filter(request -> {
                    if (filters.getCategory() != null && !filters.getCategory().equals("all")
                            && !filters.getCategory().isEmpty()) {
                        if (!request.getCategory().equalsIgnoreCase(filters.getCategory())) {
                            return false;
                        }
                    }
                    if (filters.getSearchQuery() != null && !filters.getSearchQuery().isEmpty()) {
                        String query = filters.getSearchQuery().toLowerCase();
                        if (!request.getTitle().toLowerCase().contains(query)
                                && !request.getDescription().toLowerCase().contains(query)) {
                            return false;
                        }
                    }
                    if (filters.getMinBudget() != null || filters.getMaxBudget() != null) {
                        try {
                            String budgetStr = request.getBudget().replaceAll("[^0-9.]", "");
                            double budget = Double.parseDouble(budgetStr);
                            if (filters.getMinBudget() != null && budget < filters.getMinBudget()) {
                                return false;
                            }
                            if (filters.getMaxBudget() != null && budget > filters.getMaxBudget()) {
                                return false;
                            }
                        } catch (NumberFormatException ignore) {
                        }
                    }
                    if (filters.getUrgentOnly() != null && filters.getUrgentOnly()) {
                        if (!request.getUrgent()) {
                            return false;
                        }
                    }
                    if (filters.getMinRating() != null) {
                        if (request.getUser().getRating() < filters.getMinRating()) {
                            return false;
                        }
                    }
                    if (filters.getMaxDistance() != null && filters.getUserLatitude() != null
                            && filters.getUserLongitude() != null) {
                        if (request.getLatitude() != null && request.getLongitude() != null) {
                            double distance = calculateDistance(
                                    filters.getUserLatitude(), filters.getUserLongitude(),
                                    request.getLatitude(), request.getLongitude());
                            if (distance > filters.getMaxDistance()) {
                                return false;
                            }
                        }
                    }
                    return true;
                })
                .map(this::convertToDTO)
                .sorted((r1, r2) -> {
                    String sortBy = filters.getSortBy() != null ? filters.getSortBy() : "date";
                    String sortOrder = filters.getSortOrder() != null ? filters.getSortOrder() : "desc";
                    int multiplier = sortOrder.equals("asc") ? 1 : -1;
                    switch (sortBy.toLowerCase()) {
                        case "price":
                            try {
                                double budget1 = Double.parseDouble(r1.getBudget().replaceAll("[^0-9.]", ""));
                                double budget2 = Double.parseDouble(r2.getBudget().replaceAll("[^0-9.]", ""));
                                return multiplier * Double.compare(budget1, budget2);
                            } catch (NumberFormatException e) {
                                return 0;
                            }
                        case "rating":
                            return multiplier * Double.compare(
                                    r1.getUserRating() != null ? r1.getUserRating() : 0.0,
                                    r2.getUserRating() != null ? r2.getUserRating() : 0.0);
                        case "distance":
                            if (filters.getUserLatitude() != null && filters.getUserLongitude() != null) {
                                double dist1 = request1Distance(r1, filters);
                                double dist2 = request1Distance(r2, filters);
                                return multiplier * Double.compare(dist1, dist2);
                            }
                            return 0;
                        case "date":
                        default:
                            return multiplier * Long.compare(
                                    r2.getId() != null ? r2.getId() : 0L,
                                    r1.getId() != null ? r1.getId() : 0L);
                    }
                })
                .collect(Collectors.toList());
    }

    private double request1Distance(ServiceRequestDTO request, SearchFiltersDTO filters) {
        if (request.getLatitude() != null && request.getLongitude() != null) {
            return calculateDistance(
                    filters.getUserLatitude(), filters.getUserLongitude(),
                    request.getLatitude(), request.getLongitude());
        }
        return Double.MAX_VALUE;
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }
}
