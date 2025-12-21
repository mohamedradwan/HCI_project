package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceOfferingDTO {
    private String title;
    private String category;
    private String description;
    private String price;
}
