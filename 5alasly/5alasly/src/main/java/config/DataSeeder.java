package config;

import entity.ServiceOffering;
import entity.User;
import repository.ServiceOfferingRepository;
import repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ServiceOfferingRepository offeringRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (offeringRepository.count() == 0) {
            System.out.println("Seeding demo service offerings...");

            // Try to find the first user (usually the one created during testing)
            List<User> users = userRepository.findAll();
            if (users.isEmpty()) {
                System.out.println("No users found to seed offerings for.");
                return;
            }

            User demoUser = users.get(0);

            String[][] demoOfferings = {
                    { "Advanced Math Tutoring", "Tutoring",
                            "I provide advanced calculus and linear algebra tutoring for college students.",
                            "45.0/hr" },
                    { "Full Home Deep Cleaning", "Cleaning",
                            "Professional cleaning service for apartments and houses. Everything included.",
                            "120.0 fixed" },
                    { "Expert Pipe Repair", "Home Repairs",
                            "Fixing leaks, broken pipes, and emergency plumbing issues.", "80.0/hr" },
                    { "Physics Exam Prep", "Tutoring",
                            "Helping high school and university students ace their physics exams.", "35.0/hr" },
                    { "Furniture Assembly", "Home Repairs", "Efficiently assemble IKEA and other flat-pack furniture.",
                            "50.0 fixed" }
            };

            for (String[] data : demoOfferings) {
                ServiceOffering offering = new ServiceOffering();
                offering.setUser(demoUser);
                offering.setTitle(data[0]);
                offering.setCategory(data[1]);
                offering.setDescription(data[2]);
                offering.setPrice(data[3]);
                offering.setActive(true);
                offeringRepository.save(offering);
            }

            System.out.println("Seeded 5 demo offerings for user: " + demoUser.getName());
        }
    }
}
