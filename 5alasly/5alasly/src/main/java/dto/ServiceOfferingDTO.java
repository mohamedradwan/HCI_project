package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOfferingDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String title;
    private String category;
    private String description;
    private String price;
    private Boolean active;
    private LocalDateTime createdAt;
}
