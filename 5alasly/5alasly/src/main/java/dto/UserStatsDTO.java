package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private Integer completedTasks;
    private Integer thisMonth;
    private Integer activeClients;
    private Double avgRating;
}
