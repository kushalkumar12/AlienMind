package com.interviewtogether.config;

import com.interviewtogether.domain.UserRole;
import com.interviewtogether.domain.PlatformSetting;
import com.interviewtogether.repository.PlatformSettingRepository;
import com.interviewtogether.repository.UserAccountRepository;
import com.interviewtogether.service.PlatformService;
import com.interviewtogether.web.dto.RegisterRequest;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(PlatformService service, UserAccountRepository users, PlatformSettingRepository settings) {
        return args -> {
            System.out.println("Starting DataSeeder... Current user count: " + users.count());
            seedSetting(settings, "app.name", "AlienMind", true, "🚀");
            seedSetting(settings, "app.icon", "🚀", true, null);
            seedSetting(settings, "auth.hero.title", "Practice interviews live, get rated, and become hire-ready.", true, null);
            seedSetting(settings, "auth.hero.subtitle", "Candidate login, interviewer registration, paid mock interviews, recorded sessions, voice text, ratings, and company search all start here.", true, null);
            seedSetting(settings, "dashboard.hero.title", "LinkedIn-style talent network with Zoom-style mock interviews.", true, null);
            seedSetting(settings, "dashboard.hero.subtitle", "Candidates meet people who already crossed their target level, receive ranked feedback, control recordings, and become discoverable to companies.", true, null);
            seedSetting(settings, "room.title", "Live interview room", true, null);
            seedSetting(settings, "search.interviewer.title", "Find interviewers", true, null);
            seedSetting(settings, "search.candidate.title", "Search candidates", true, null);
            seedSetting(settings, "result.title", "Candidate result", true, null);
            seedSetting(settings, "transcript.title", "Real-time voice text", true, null);

            if (!users.existsByEmail("admin@u.com")) {
                service.register(new RegisterRequest(
                        "Administrator", "admin@u.com", "123", UserRole.ADMIN,
                        List.of(), null, null, null, null, null
                ));
            }

            if (users.count() > 1) {
                return;
            }

            for (int i = 1; i <= 50; i++) {
                String email = "u" + i + "@u.com";
                UserRole role = i <= 30 ? UserRole.CANDIDATE : (i <= 45 ? UserRole.INTERVIEWER : UserRole.COMPANY);
                service.register(new RegisterRequest(
                        "User " + i, email, "123", role,
                        List.of("Skill " + (i % 5)), "Seeded profile for " + email,
                        role == UserRole.INTERVIEWER ? "Senior Rank" : null,
                        role == UserRole.INTERVIEWER ? BigDecimal.valueOf(50 + i) : null,
                        role == UserRole.COMPANY ? "BigTech " + i : null,
                        role == UserRole.COMPANY ? "Recruitment" : null
                ));
            }
            System.out.println("DataSeeder completed successfully.");
        };
    }

    private void seedSetting(@NonNull PlatformSettingRepository settings, @NonNull String key, @NonNull String value, boolean publicSetting, String iconData) {
        if (!settings.existsById(key)) {
            settings.save(new PlatformSetting(key, value, publicSetting, iconData));
        }
    }
}
