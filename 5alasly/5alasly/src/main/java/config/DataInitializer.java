package config;

import entity.*;
import repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ServiceRequestRepository requestRepository;

    @Override
    public void run(String... args) {
        // Create sample users
        User user1 = new User();
        user1.setName("Ahmed Hassan");
        user1.setEmail("ahmed@example.com");
        user1.setPhone("+201234567890");
        user1.setPasswordHash("hashed_password123");
        user1.setRating(4.8);
        user1.setTotalReviews(23);
        user1.setCompletedTasks(23);
        user1.setActiveClients(15);
        user1.setVerified(true);
        userRepository.save(user1);

        User user2 = new User();
        user2.setName("Sarah Ahmed");
        user2.setEmail("sarah@example.com");
        user2.setPhone("+201234567891");
        user2.setPasswordHash("hashed_password123");
        user2.setRating(4.8);
        user2.setTotalReviews(15);
        user2.setCompletedTasks(18);
        user2.setActiveClients(10);
        user2.setVerified(true);
        userRepository.save(user2);

        User user3 = new User();
        user3.setName("Mohammed Ali");
        user3.setEmail("mohammed@example.com");
        user3.setPhone("+201234567892");
        user3.setPasswordHash("hashed_password123");
        user3.setRating(4.9);
        user3.setTotalReviews(20);
        user3.setCompletedTasks(25);
        user3.setActiveClients(12);
        user3.setVerified(true);
        userRepository.save(user3);

        User user4 = new User();
        user4.setName("Fatima Hassan");
        user4.setEmail("fatima@example.com");
        user4.setPhone("+201234567893");
        user4.setPasswordHash("hashed_password123");
        user4.setRating(5.0);
        user4.setTotalReviews(30);
        user4.setCompletedTasks(32);
        user4.setActiveClients(18);
        user4.setVerified(true);
        userRepository.save(user4);

        // Create sample service requests
        ServiceRequest req1 = new ServiceRequest();
        req1.setTitle("Need help moving furniture");
        req1.setCategory("Transportation");
        req1.setDescription("I need help moving a couch, dining table, and several boxes from my apartment to a new place about 5 km away.");
        req1.setBudget("$25");
        req1.setLocation("Nasr City, Cairo");
        req1.setDate(LocalDate.now().plusDays(2));
        req1.setTime(LocalTime.of(10, 0));
        req1.setUser(user2);
        req1.setUrgent(true);
        requestRepository.save(req1);

        ServiceRequest req2 = new ServiceRequest();
        req2.setTitle("Fix leaking kitchen sink");
        req2.setCategory("Home Repairs");
        req2.setDescription("My kitchen sink has been leaking for a few days. Need someone experienced to fix it properly.");
        req2.setBudget("$40");
        req2.setLocation("Maadi, Cairo");
        req2.setDate(LocalDate.now().plusDays(1));
        req2.setTime(LocalTime.of(14, 0));
        req2.setUser(user3);
        req2.setUrgent(false);
        requestRepository.save(req2);

        ServiceRequest req3 = new ServiceRequest();
        req3.setTitle("Math tutoring for high school");
        req3.setCategory("Tutoring");
        req3.setDescription("Looking for a math tutor for my son who is in grade 11. Need help with calculus and algebra.");
        req3.setBudget("$30/hr");
        req3.setLocation("Heliopolis, Cairo");
        req3.setDate(LocalDate.now().plusDays(3));
        req3.setTime(LocalTime.of(16, 0));
        req3.setUser(user4);
        req3.setUrgent(false);
        requestRepository.save(req3);

        System.out.println("✅ Sample data initialized successfully!");
        System.out.println("📊 Users created: 4");
        System.out.println("📋 Service requests created: 3");
        System.out.println("🌐 H2 Console: http://localhost:8080/h2-console");
        System.out.println("   JDBC URL: jdbc:h2:mem:salaslydb");
        System.out.println("   Username: sa");
        System.out.println("   Password: (leave empty)");
    }
}