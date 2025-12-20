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
        if (userRepository.count() == 0) {
            // Create sample users with valid passwords and locations in Alex and Cairo
            User user1 = new User();
            user1.setName("Ahmed Hassan");
            user1.setEmail("ahmed@example.com");
            user1.setPhone("0123456789012");
            user1.setPasswordHash("hashed_Password123"); // Valid: uppercase, lowercase, number
            user1.setRating(4.8);
            user1.setTotalReviews(23);
            user1.setCompletedTasks(23);
            user1.setActiveClients(15);
            user1.setVerified(true);
            user1.setLatitude(30.0444); // Cairo
            user1.setLongitude(31.2357);
            user1.setAddress("Nasr City, Cairo");
            user1.setAvatarUrl("https://i.pravatar.cc/150?img=1");
            userRepository.save(user1);

            User user2 = new User();
            user2.setName("Sarah Ahmed");
            user2.setEmail("sarah@example.com");
            user2.setPhone("0123456789013");
            user2.setPasswordHash("hashed_Welcome123");
            user2.setRating(4.8);
            user2.setTotalReviews(15);
            user2.setCompletedTasks(18);
            user2.setActiveClients(10);
            user2.setVerified(true);
            user2.setLatitude(31.2156); // Alexandria
            user2.setLongitude(29.9553);
            user2.setAddress("Stanley, Alexandria");
            user2.setAvatarUrl("https://i.pravatar.cc/150?img=5");
            userRepository.save(user2);

            User user3 = new User();
            user3.setName("Mohammed Ali");
            user3.setEmail("mohammed@example.com");
            user3.setPhone("0123456789014");
            user3.setPasswordHash("hashed_Secure789");
            user3.setRating(4.9);
            user3.setTotalReviews(20);
            user3.setCompletedTasks(25);
            user3.setActiveClients(12);
            user3.setVerified(true);
            user3.setLatitude(30.0131); // Maadi, Cairo
            user3.setLongitude(31.2623);
            user3.setAddress("Maadi, Cairo");
            user3.setAvatarUrl("https://i.pravatar.cc/150?img=8");
            userRepository.save(user3);

            User user4 = new User();
            user4.setName("Fatima Hassan");
            user4.setEmail("fatima@example.com");
            user4.setPhone("0123456789015");
            user4.setPasswordHash("hashed_Strong456");
            user4.setRating(5.0);
            user4.setTotalReviews(30);
            user4.setCompletedTasks(32);
            user4.setActiveClients(18);
            user4.setVerified(true);
            user4.setLatitude(31.2001); // Sidi Gaber, Alexandria
            user4.setLongitude(29.9187);
            user4.setAddress("Sidi Gaber, Alexandria");
            user4.setAvatarUrl("https://i.pravatar.cc/150?img=9");
            userRepository.save(user4);

            // Create sample service requests with coordinates
            ServiceRequest req1 = new ServiceRequest();
            req1.setTitle("Need help moving furniture");
            req1.setCategory("Transportation");
            req1.setDescription(
                    "I need help moving a couch, dining table, and several boxes from my apartment to a new place about 5 km away.");
            req1.setBudget("$25");
            req1.setLocation("Nasr City, Cairo");
            req1.setLatitude(30.0626); // Nasr City
            req1.setLongitude(31.3495);
            req1.setDate(LocalDate.now().plusDays(2));
            req1.setTime(LocalTime.of(10, 0));
            req1.setUser(user2);
            req1.setUrgent(true);
            requestRepository.save(req1);

            ServiceRequest req2 = new ServiceRequest();
            req2.setTitle("Fix leaking kitchen sink");
            req2.setCategory("Home Repairs");
            req2.setDescription(
                    "My kitchen sink has been leaking for a few days. Need someone experienced to fix it properly.");
            req2.setBudget("$40");
            req2.setLocation("Maadi, Cairo");
            req2.setLatitude(30.0131); // Maadi
            req2.setLongitude(31.2623);
            req2.setDate(LocalDate.now().plusDays(1));
            req2.setTime(LocalTime.of(14, 0));
            req2.setUser(user3);
            req2.setUrgent(false);
            requestRepository.save(req2);

            ServiceRequest req3 = new ServiceRequest();
            req3.setTitle("Math tutoring for high school");
            req3.setCategory("Tutoring");
            req3.setDescription(
                    "Looking for a math tutor for my son who is in grade 11. Need help with calculus and algebra.");
            req3.setBudget("$30/hr");
            req3.setLocation("Stanley, Alexandria");
            req3.setLatitude(31.2156); // Stanley, Alexandria
            req3.setLongitude(29.9553);
            req3.setDate(LocalDate.now().plusDays(3));
            req3.setTime(LocalTime.of(16, 0));
            req3.setUser(user4);
            req3.setUrgent(false);
            requestRepository.save(req3);

            ServiceRequest req4 = new ServiceRequest();
            req4.setTitle("Delivery needed from Cairo to Alex");
            req4.setCategory("Delivery");
            req4.setDescription(
                    "I need someone to pick up a package from downtown Cairo and deliver it to Smouha, Alexandria. Package weighs about 5kg.");
            req4.setBudget("$50");
            req4.setLocation("Downtown, Cairo");
            req4.setLatitude(30.0459); // Downtown Cairo
            req4.setLongitude(31.2243);
            req4.setDate(LocalDate.now().plusDays(4));
            req4.setTime(LocalTime.of(9, 0));
            req4.setUser(user1);
            req4.setUrgent(true);
            requestRepository.save(req4);

            ServiceRequest req5 = new ServiceRequest();
            req5.setTitle("Deep cleaning for apartment");
            req5.setCategory("Cleaning");
            req5.setDescription(
                    "Need a thorough deep cleaning for a 3-bedroom apartment. Including kitchen, bathrooms, and balconies.");
            req5.setBudget("$60");
            req5.setLocation("Smouha, Alexandria");
            req5.setLatitude(31.2089); // Smouha, Alexandria
            req5.setLongitude(29.9372);
            req5.setDate(LocalDate.now().plusDays(5));
            req5.setTime(LocalTime.of(11, 0));
            req5.setUser(user2);
            req5.setUrgent(false);
            requestRepository.save(req5);

            System.out.println("✅ Sample data initialized successfully!");
            System.out.println("📊 Users created: 4 (with addresses in Cairo & Alexandria)");
            System.out.println("📋 Service requests created: 5");
            System.out.println("🌐 H2 Console: http://localhost:8080/h2-console");
            System.out.println("   JDBC URL: jdbc:h2:mem:salaslydb");
            System.out.println("   Username: sa");
            System.out.println("   Password: (leave empty)");
        }
    }
}
