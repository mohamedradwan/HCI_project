package dto;

import entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private Long relatedRequestId;
    private Long relatedUserId;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private String timeAgo;

    public static NotificationDTO fromEntity(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setType(notification.getType().name());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRelatedRequestId(notification.getRelatedRequestId());
        dto.setRelatedUserId(notification.getRelatedUserId());
        dto.setIsRead(notification.getIsRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setTimeAgo(calculateTimeAgo(notification.getCreatedAt()));
        return dto;
    }

    private static String calculateTimeAgo(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        long seconds = java.time.Duration.between(dateTime, now).getSeconds();

        if (seconds < 60)
            return "Just now";
        if (seconds < 3600)
            return (seconds / 60) + " minutes ago";
        if (seconds < 86400)
            return (seconds / 3600) + " hours ago";
        if (seconds < 604800)
            return (seconds / 86400) + " days ago";
        return dateTime.toLocalDate().toString();
    }
}
