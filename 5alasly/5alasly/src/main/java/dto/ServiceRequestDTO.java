package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRequestDTO {
    private Long id;
    private String title;
    private String category;
    private String description;
    private String budget;
    private String location;
    private LocalDate date;
    private LocalTime time;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Double userRating;
    private String status;
    private Boolean urgent;
    private String distance;
    private String timeAgo;

    // Request location for distance calculation
    private Double latitude;
    private Double longitude;

    // Helper (worker) info
    private Long helperId;
    private String helperName;
    private String helperAvatar;
    private Double helperRating;

    // Like/dislike counts
    private Long likeCount;
    private Long dislikeCount;
}
