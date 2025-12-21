package dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchFiltersDTO {
    private String category;
    private String searchQuery;
    private Double minBudget;
    private Double maxBudget;
    private Double maxDistance; // in kilometers
    private Double userLatitude;
    private Double userLongitude;
    private Boolean urgentOnly;
    private Double minRating;
    private String sortBy; // price, distance, rating, date
    private String sortOrder; // asc, desc
}
