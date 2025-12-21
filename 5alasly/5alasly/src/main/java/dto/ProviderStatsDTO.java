package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderStatsDTO {
    private Integer activeServices;
    private Double totalEarnings;
    private Double avgRating;
    private Integer totalReviews;
    private Integer completedTasksMonth;
    private Map<String, Double> earningsHistory;
    private Map<String, Integer> categoryStats;
}
