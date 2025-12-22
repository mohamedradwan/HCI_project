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
                        // Create sample users with TV character personas in Egyptian locations
                        User user1 = new User();
                        user1.setName("Dexter Morgan");
                        user1.setEmail("dexter@example.com");
                        user1.setPhone("0123456789012");
                        user1.setPasswordHash("hashed_Password123");
                        user1.setRating(4.9);
                        user1.setTotalReviews(47);
                        user1.setCompletedTasks(52);
                        user1.setActiveClients(8);
                        user1.setVerified(true);
                        user1.setLatitude(30.0631);
                        user1.setLongitude(31.2211);
                        user1.setAddress("Zamalek, Cairo");
                        user1.setAvatarUrl(
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDs1IwYmPpmUZh3QjNthbQjPSHBwHAofAGM_l5o22CVpF99AflJBDWIuq5_oRESHU57foyjyOrBXPPYoVoJRphgWjuSqc-aG2nvMNTYo&s=10");
                        userRepository.save(user1);

                        User user2 = new User();
                        user2.setName("Jesse Pinkman");
                        user2.setEmail("jesse@example.com");
                        user2.setPhone("0123456789013");
                        user2.setPasswordHash("hashed_Welcome123");
                        user2.setRating(4.5);
                        user2.setTotalReviews(23);
                        user2.setCompletedTasks(28);
                        user2.setActiveClients(12);
                        user2.setVerified(true);
                        user2.setLatitude(31.2156);
                        user2.setLongitude(29.9553);
                        user2.setAddress("Miami, Alexandria");
                        user2.setAvatarUrl(
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2v_lfehp-iudORp7pzTD4ej05LW1AbhGRgg&s");
                        userRepository.save(user2);

                        User user3 = new User();
                        user3.setName("Elliot Alderson");
                        user3.setEmail("elliot@example.com");
                        user3.setPhone("0123456789014");
                        user3.setPasswordHash("hashed_Secure789");
                        user3.setRating(5.0);
                        user3.setTotalReviews(89);
                        user3.setCompletedTasks(95);
                        user3.setActiveClients(25);
                        user3.setVerified(true);
                        user3.setLatitude(30.0131);
                        user3.setLongitude(31.2623);
                        user3.setAddress("Maadi, Cairo");
                        user3.setAvatarUrl(
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNF-0HzkQoByYh9Sxn0ZqJEqLg00xXFEgaFw&s");
                        userRepository.save(user3);

                        User user4 = new User();
                        user4.setName("Daenerys Targaryen");
                        user4.setEmail("daenerys@example.com");
                        user4.setPhone("0123456789015");
                        user4.setPasswordHash("hashed_Strong456");
                        user4.setRating(4.8);
                        user4.setTotalReviews(156);
                        user4.setCompletedTasks(142);
                        user4.setActiveClients(45);
                        user4.setVerified(true);
                        user4.setLatitude(31.2001);
                        user4.setLongitude(29.9187);
                        user4.setAddress("Montazah, Alexandria");
                        user4.setAvatarUrl(
                                        "https://hips.hearstapps.com/hmg-prod/images/daenerys-targaryen-muere-juego-de-tronos-1552384785.jpg?crop=0.570xw:1.00xh;0.143xw,0&resize=1200:*");
                        userRepository.save(user4);

                        User user5 = new User();
                        user5.setName("Walter White");
                        user5.setEmail("walter@example.com");
                        user5.setPhone("0123456789016");
                        user5.setPasswordHash("hashed_Heisenberg1");
                        user5.setRating(4.7);
                        user5.setTotalReviews(67);
                        user5.setCompletedTasks(71);
                        user5.setActiveClients(15);
                        user5.setVerified(true);
                        user5.setLatitude(30.0626);
                        user5.setLongitude(31.3495);
                        user5.setAddress("Nasr City, Cairo");
                        user5.setAvatarUrl(
                                        "https://mir-s3-cdn-cf.behance.net/project_modules/hd/b51190101362045.5f1d68546ac50.jpg");
                        userRepository.save(user5);

                        User user6 = new User();
                        user6.setName("Sherlock Holmes");
                        user6.setEmail("sherlock@example.com");
                        user6.setPhone("0123456789017");
                        user6.setPasswordHash("hashed_Elementary1");
                        user6.setRating(5.0);
                        user6.setTotalReviews(234);
                        user6.setCompletedTasks(248);
                        user6.setActiveClients(38);
                        user6.setVerified(true);
                        user6.setLatitude(30.0459);
                        user6.setLongitude(31.2243);
                        user6.setAddress("Garden City, Cairo");
                        user6.setAvatarUrl(
                                        "https://i.guim.co.uk/img/media/ffc016b01f45eeec94ff69dc59eb65a9137ae52a/0_95_3500_2101/master/3500.jpg?width=465&dpr=1&s=none&crop=5%3A4");
                        userRepository.save(user6);

                        User user7 = new User();
                        user7.setName("Michael Corleone");
                        user7.setEmail("michael@example.com");
                        user7.setPhone("0123456789018");
                        user7.setPasswordHash("hashed_Family123");
                        user7.setRating(4.7);
                        user7.setTotalReviews(89);
                        user7.setCompletedTasks(92);
                        user7.setActiveClients(20);
                        user7.setVerified(true);
                        user7.setLatitude(30.0866);
                        user7.setLongitude(31.3238);
                        user7.setAddress("Heliopolis, Cairo");
                        user7.setAvatarUrl(
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmy_AQ6xiqCrxgeblnpbadNdPj2kwy-m170Q&s");
                        userRepository.save(user7);

                        User user8 = new User();
                        user8.setName("Tony Soprano");
                        user8.setEmail("tony@example.com");
                        user8.setPhone("0123456789019");
                        user8.setPasswordHash("hashed_Jersey123");
                        user8.setRating(4.4);
                        user8.setTotalReviews(45);
                        user8.setCompletedTasks(48);
                        user8.setActiveClients(12);
                        user8.setVerified(true);
                        user8.setLatitude(30.0396);
                        user8.setLongitude(31.2139);
                        user8.setAddress("Dokki, Cairo");
                        user8.setAvatarUrl(
                                        "https://media.newyorker.com/photos/5909521c2179605b11ad334b/master/w_2560%2Cc_limit/tony-soprano-1024-580.jpg");
                        userRepository.save(user8);

                        User user9 = new User();
                        user9.setName("Hannibal Lecter");
                        user9.setEmail("hannibal@example.com");
                        user9.setPhone("0123456789020");
                        user9.setPasswordHash("hashed_Cuisine123");
                        user9.setRating(4.9);
                        user9.setTotalReviews(78);
                        user9.setCompletedTasks(82);
                        user9.setActiveClients(18);
                        user9.setVerified(true);
                        user9.setLatitude(31.2089);
                        user9.setLongitude(29.9372);
                        user9.setAddress("Smouha, Alexandria");
                        user9.setAvatarUrl(
                                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6s0SQTCAtjSa5q5I4IjNN9zXNluAYM36wXA&s");
                        userRepository.save(user9);

                        User user10 = new User();
                        user10.setName("Tyrion Lannister");
                        user10.setEmail("tyrion@example.com");
                        user10.setPhone("0123456789021");
                        user10.setPasswordHash("hashed_Wine123");
                        user10.setRating(4.8);
                        user10.setTotalReviews(167);
                        user10.setCompletedTasks(175);
                        user10.setActiveClients(35);
                        user10.setVerified(true);
                        user10.setLatitude(30.0263);
                        user10.setLongitude(31.4117);
                        user10.setAddress("New Cairo");
                        user10.setAvatarUrl("https://i.insider.com/59a5ee15248849365d64d5f5?width=700");
                        userRepository.save(user10);

                        // Create sample service requests with character-appropriate tasks
                        ServiceRequest req1 = new ServiceRequest();
                        req1.setTitle("Need a licensed therapist");
                        req1.setCategory("Other Services");
                        req1.setDescription(
                                        "I'm looking for a professional therapist who can help me work through some personal issues. I have a demanding job and need someone discreet and understanding. Evening appointments preferred.");
                        req1.setBudget("$100/session");
                        req1.setLocation("Zamalek, Cairo");
                        req1.setLatitude(30.0631);
                        req1.setLongitude(31.2211);
                        req1.setDate(LocalDate.now().plusDays(2));
                        req1.setTime(LocalTime.of(19, 0));
                        req1.setUser(user1);
                        req1.setUrgent(true);
                        requestRepository.save(req1);

                        ServiceRequest req2 = new ServiceRequest();
                        req2.setTitle("Chemistry tutoring needed urgently");
                        req2.setCategory("Tutoring");
                        req2.setDescription(
                                        "Yo, I need help with my chemistry course. Struggling with organic chemistry and molecular structures. Need someone patient who can explain things simply. I learn better with hands-on examples.");
                        req2.setBudget("$35/hr");
                        req2.setLocation("Miami, Alexandria");
                        req2.setLatitude(31.2156);
                        req2.setLongitude(29.9553);
                        req2.setDate(LocalDate.now().plusDays(1));
                        req2.setTime(LocalTime.of(15, 0));
                        req2.setUser(user2);
                        req2.setUrgent(true);
                        requestRepository.save(req2);

                        ServiceRequest req3 = new ServiceRequest();
                        req3.setTitle("Cyber security course assistance");
                        req3.setCategory("Tutoring");
                        req3.setDescription(
                                        "Looking for someone knowledgeable in network security and ethical hacking. I need help understanding penetration testing, encryption protocols, and vulnerability assessments. Remote sessions preferred.");
                        req3.setBudget("$50/hr");
                        req3.setLocation("Maadi, Cairo");
                        req3.setLatitude(30.0131);
                        req3.setLongitude(31.2623);
                        req3.setDate(LocalDate.now().plusDays(3));
                        req3.setTime(LocalTime.of(22, 0));
                        req3.setUser(user3);
                        req3.setUrgent(false);
                        requestRepository.save(req3);

                        ServiceRequest req4 = new ServiceRequest();
                        req4.setTitle("Event planning for leadership workshop");
                        req4.setCategory("Other Services");
                        req4.setDescription(
                                        "I'm organizing a leadership and empowerment workshop for young professionals. Need help with venue setup, catering coordination, and managing attendees. Must be detail-oriented and passionate about making a difference.");
                        req4.setBudget("$200");
                        req4.setLocation("Montazah, Alexandria");
                        req4.setLatitude(31.2001);
                        req4.setLongitude(29.9187);
                        req4.setDate(LocalDate.now().plusDays(7));
                        req4.setTime(LocalTime.of(10, 0));
                        req4.setUser(user4);
                        req4.setUrgent(false);
                        requestRepository.save(req4);

                        ServiceRequest req5 = new ServiceRequest();
                        req5.setTitle("Science tutor for advanced chemistry");
                        req5.setCategory("Tutoring");
                        req5.setDescription(
                                        "Looking for someone to help teach advanced chemistry concepts. I have a background in the subject and need assistance preparing lesson materials and experiments for my students. Precision is key.");
                        req5.setBudget("$45/hr");
                        req5.setLocation("Nasr City, Cairo");
                        req5.setLatitude(30.0626);
                        req5.setLongitude(31.3495);
                        req5.setDate(LocalDate.now().plusDays(4));
                        req5.setTime(LocalTime.of(16, 0));
                        req5.setUser(user5);
                        req5.setUrgent(false);
                        requestRepository.save(req5);

                        ServiceRequest req6 = new ServiceRequest();
                        req6.setTitle("Research assistant for investigation");
                        req6.setCategory("Other Services");
                        req6.setDescription(
                                        "I need a meticulous assistant to help gather and organize information for an ongoing investigation. Must have excellent attention to detail, analytical thinking, and discretion. Background in research is preferred.");
                        req6.setBudget("$60/hr");
                        req6.setLocation("Garden City, Cairo");
                        req6.setLatitude(30.0459);
                        req6.setLongitude(31.2243);
                        req6.setDate(LocalDate.now().plusDays(1));
                        req6.setTime(LocalTime.of(11, 0));
                        req6.setUser(user6);
                        req6.setUrgent(true);
                        requestRepository.save(req6);

                        ServiceRequest req7 = new ServiceRequest();
                        req7.setTitle("Piano lessons for beginners");
                        req7.setCategory("Tutoring");
                        req7.setDescription(
                                        "Looking for a patient piano teacher for my daughter. She is 8 years old and just starting to learn. We have a piano at home. Flexible schedule, preferably weekends.");
                        req7.setBudget("$40/hr");
                        req7.setLocation("Heliopolis, Cairo");
                        req7.setLatitude(30.0866);
                        req7.setLongitude(31.3238);
                        req7.setDate(LocalDate.now().plusDays(5));
                        req7.setTime(LocalTime.of(16, 0));
                        req7.setUser(user7);
                        req7.setUrgent(false);
                        requestRepository.save(req7);

                        ServiceRequest req8 = new ServiceRequest();
                        req8.setTitle("Personal fitness trainer needed");
                        req8.setCategory("Other Services");
                        req8.setDescription(
                                        "I need a personal trainer who can help me get back in shape. Looking for someone who can come to my home. I have some health issues so need someone experienced with that. Morning sessions preferred.");
                        req8.setBudget("$50/session");
                        req8.setLocation("Dokki, Cairo");
                        req8.setLatitude(30.0396);
                        req8.setLongitude(31.2139);
                        req8.setDate(LocalDate.now().plusDays(2));
                        req8.setTime(LocalTime.of(7, 0));
                        req8.setUser(user8);
                        req8.setUrgent(true);
                        requestRepository.save(req8);

                        ServiceRequest req9 = new ServiceRequest();
                        req9.setTitle("Private chef for dinner party");
                        req9.setCategory("Other Services");
                        req9.setDescription(
                                        "I am hosting an intimate dinner party for 8 guests and need a skilled chef to prepare a gourmet multi-course meal. Must have experience with fine dining. I have very refined tastes.");
                        req9.setBudget("$300");
                        req9.setLocation("Smouha, Alexandria");
                        req9.setLatitude(31.2089);
                        req9.setLongitude(29.9372);
                        req9.setDate(LocalDate.now().plusDays(10));
                        req9.setTime(LocalTime.of(19, 0));
                        req9.setUser(user9);
                        req9.setUrgent(false);
                        requestRepository.save(req9);

                        ServiceRequest req10 = new ServiceRequest();
                        req10.setTitle("Business strategy consultant");
                        req10.setCategory("Other Services");
                        req10.setDescription(
                                        "Looking for a sharp mind to help with business strategy and negotiations. I drink and I know things, but need someone who knows more. Discretion and wit are essential.");
                        req10.setBudget("$80/hr");
                        req10.setLocation("New Cairo");
                        req10.setLatitude(30.0263);
                        req10.setLongitude(31.4117);
                        req10.setDate(LocalDate.now().plusDays(3));
                        req10.setTime(LocalTime.of(14, 0));
                        req10.setUser(user10);
                        req10.setUrgent(false);
                        requestRepository.save(req10);

                        ServiceRequest req11 = new ServiceRequest();
                        req11.setTitle("Dog walking services needed");
                        req11.setCategory("Other Services");
                        req11.setDescription(
                                        "Need someone reliable to walk my German Shepherd twice a day. He is friendly but strong. Must be comfortable with large dogs. Regular schedule Monday to Friday.");
                        req11.setBudget("$15/walk");
                        req11.setLocation("Nasr City, Cairo");
                        req11.setLatitude(30.0566);
                        req11.setLongitude(31.3301);
                        req11.setDate(LocalDate.now().plusDays(1));
                        req11.setTime(LocalTime.of(8, 0));
                        req11.setUser(user5);
                        req11.setUrgent(false);
                        requestRepository.save(req11);

                        ServiceRequest req12 = new ServiceRequest();
                        req12.setTitle("Home deep cleaning service");
                        req12.setCategory("Cleaning");
                        req12.setDescription(
                                        "Need a thorough deep cleaning for my 4-bedroom apartment. Including all rooms, kitchen appliances, windows, and balconies. Must use eco-friendly products. One-time service.");
                        req12.setBudget("$150");
                        req12.setLocation("Garden City, Cairo");
                        req12.setLatitude(30.0459);
                        req12.setLongitude(31.2243);
                        req12.setDate(LocalDate.now().plusDays(6));
                        req12.setTime(LocalTime.of(9, 0));
                        req12.setUser(user6);
                        req12.setUrgent(false);
                        requestRepository.save(req12);

                        System.out.println("✅ Sample data initialized successfully!");
                        System.out.println("📊 Users created: 10 (with addresses in Cairo & Alexandria)");
                        System.out.println("📋 Service requests created: 12");
                        System.out.println("🌐 H2 Console: http://localhost:8080/h2-console");
                        System.out.println("   JDBC URL: jdbc:h2:mem:salaslydb");
                        System.out.println("   Username: sa");
                        System.out.println("   Password: (leave empty)");
                }
        }
}
