package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequestDTO {
    private String title;
    private String category;
    private String description;
    private String budget;
    private String location;
    private LocalDate date;
    private LocalTime time;
    private Boolean urgent;
}

