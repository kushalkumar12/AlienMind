package com.interviewtogether.service;

import com.interviewtogether.domain.*;
import com.interviewtogether.repository.*;
import com.interviewtogether.web.dto.CandidateDashboardResponse;
import com.interviewtogether.web.dto.CompanyDashboardResponse;
import com.interviewtogether.web.dto.CompanyDashboardResponse.CandidateSummary;
import com.interviewtogether.web.dto.CompanyDashboardResponse.InterviewerSummary;
import com.interviewtogether.web.dto.InterviewRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserAccountRepository users;
    private final CandidateProfileRepository candidates;
    private final InterviewerProfileRepository interviewers;
    private final CompanyProfileRepository companies;
    private final JobPostRepository jobPosts;
    private final NotificationRepository notifications;
    private final InterviewSessionRepository sessions;
    private final UserConnectionRepository connections;
    private final InterviewResultRepository results;
    private final ConnectionService connectionService;

    public DashboardService(
            UserAccountRepository users,
            CandidateProfileRepository candidates,
            InterviewerProfileRepository interviewers,
            CompanyProfileRepository companies,
            JobPostRepository jobPosts,
            NotificationRepository notifications,
            InterviewSessionRepository sessions,
            UserConnectionRepository connections,
            InterviewResultRepository results,
            ConnectionService connectionService) {
        this.users = users;
        this.candidates = candidates;
        this.interviewers = interviewers;
        this.companies = companies;
        this.jobPosts = jobPosts;
        this.notifications = notifications;
        this.sessions = sessions;
        this.connections = connections;
        this.results = results;
        this.connectionService = connectionService;
    }

    public CandidateDashboardResponse candidateDashboard(String email) {
        UserAccount user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        CandidateProfile profile = candidates.findByUserId(user.getId())
                .orElseGet(() -> dummyCandidateProfile(user));

        // Fetch Dynamic Data from DB
        List<CandidateDashboardResponse.JobPostDTO> jobs = jobPosts.findAll().stream()
                .limit(10)
                .map(j -> new CandidateDashboardResponse.JobPostDTO(
                        j.getId(), j.getTitle(), j.getCompany().getCompanyName(), j.getSiteName(), 
                        DateTimeFormatter.ISO_INSTANT.format(j.getPostedAt())))
                .collect(Collectors.toList());

        List<CandidateDashboardResponse.NotificationDTO> recentNotifs = notifications.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .limit(20)
                .map(n -> new CandidateDashboardResponse.NotificationDTO(
                        n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.isRead(),
                        DateTimeFormatter.ISO_INSTANT.format(n.getCreatedAt())))
                .collect(Collectors.toList());

        List<CandidateDashboardResponse.InterviewDTO> upcomingInterviews = sessions.findAll().stream()
                .filter(s -> s.getCandidate().getId().equals(profile.getId()))
                .limit(10)
                .map(s -> new CandidateDashboardResponse.InterviewDTO(
                        s.getId(), s.getInterviewer().getUser().getFullName(), s.getStatus().name(),
                        DateTimeFormatter.ISO_INSTANT.format(s.getScheduledAt()), s.getRoomUrl()))
                .collect(Collectors.toList());

        // Connections & Messages
        List<CandidateDashboardResponse.ConnectionDTO> userConnections = connections.findByRequesterIdOrReceiverId(user.getId(), user.getId()).stream()
                .limit(20)
                .map(c -> {
                    boolean isRequester = c.getRequester().getId().equals(user.getId());
                    UserAccount other = isRequester ? c.getReceiver() : c.getRequester();
                    int mutuals = connectionService.getMutualConnectionCount(user.getId(), other.getId());
                    
                    return new CandidateDashboardResponse.ConnectionDTO(
                        other.getId(), other.getFullName(), other.getRole().name(), "#0F172A", 
                        c.getStatus(), c.getId(), isRequester,
                        List.of("Engineering", "System Design", "Cloud"),
                        85 + (other.getId().intValue() % 15), // skillMatch
                        90 + (other.getId().intValue() % 10), // aiCompatibility
                        "Senior", "Available", mutuals
                    );
                })
                .collect(Collectors.toList());

        CandidateDashboardResponse response = new CandidateDashboardResponse(
                profile.getId(),
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                profile.getCurrentLevel(),
                List.copyOf(profile.getSkills()),
                profile.getSummary(),
                profile.getAverageRating(),
                profile.getCompletedInterviews(),
                profile.getPublicResults(),
                profile.getPublicRecordings(),
                jobs,
                recentNotifs,
                upcomingInterviews,
                userConnections,
                List.of(), // Messages can be added similarly
                calculateAnalytics(profile),
                new CandidateDashboardResponse.NetworkingInsightsDTO(12, 24, 94, 8)
        );
        return response;
    }

    private CandidateDashboardResponse.AnalyticsDTO calculateAnalytics(CandidateProfile profile) {
        List<InterviewResult> candidateResults = results.findBySession_Candidate_Id(profile.getId());
        
        int readinessScore = (int) (profile.getAverageRating() * 20);
        double successRate = candidateResults.isEmpty() ? 0.0 : 
            (candidateResults.stream().filter(r -> r.getCandidateScore() >= 4).count() * 100.0 / candidateResults.size());
            
        long higherRanked = candidates.countByAverageRatingGreaterThan(profile.getAverageRating());
        long totalCandidates = candidates.count();
        String globalRank = "Top " + Math.max(1, (int)((higherRanked * 100.0) / Math.max(1, totalCandidates))) + "%";

        List<CandidateDashboardResponse.TrendPointDTO> trend = candidateResults.stream()
            .sorted((a, b) -> b.getSession().getScheduledAt().compareTo(a.getSession().getScheduledAt()))
            .limit(6)
            .map(r -> new CandidateDashboardResponse.TrendPointDTO(
                DateTimeFormatter.ofPattern("MM-dd").withZone(java.time.ZoneId.systemDefault()).format(r.getSession().getScheduledAt()),
                (int)(r.getCandidateScore() * 20)))
            .collect(Collectors.toList());

        List<CandidateDashboardResponse.SkillPerformanceDTO> skillPerformance = List.of(
            new CandidateDashboardResponse.SkillPerformanceDTO("Technical", (int)(candidateResults.stream().mapToDouble(InterviewResult::getTechnicalScore).average().orElse(0.0) * 20), "+2%"),
            new CandidateDashboardResponse.SkillPerformanceDTO("Communication", (int)(candidateResults.stream().mapToDouble(InterviewResult::getCommunicationScore).average().orElse(0.0) * 20), "+5%"),
            new CandidateDashboardResponse.SkillPerformanceDTO("Domain", (int)(profile.getAverageRating() * 18), "+1%")
        );

        return new CandidateDashboardResponse.AnalyticsDTO(readinessScore, successRate, globalRank, trend, skillPerformance);
    }

    public void requestInterview(InterviewRequestDTO dto) {
        UserAccount user = users.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        CandidateProfile candidate = candidates.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Candidate profile not found"));

        // Pick a random/first interviewer for now as a placeholder
        InterviewerProfile interviewer = interviewers.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "No interviewers available"));

        Instant scheduledAt;
        try {
            scheduledAt = Instant.parse(dto.getScheduledAt());
        } catch (Exception e) {
            // Fallback for datetime-local format if needed, or just use now
            scheduledAt = Instant.now().plus(java.time.Duration.ofDays(1));
        }

        InterviewSession session = new InterviewSession(
                candidate, 
                interviewer, 
                scheduledAt, 
                "https://meet.alienmind.io/room/" + java.util.UUID.randomUUID().toString().substring(0, 8)
        );
        
        sessions.save(session);
    }

    public CompanyDashboardResponse companyDashboard(String email) {
        UserAccount user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        CompanyProfile company = companies.findByUserId(user.getId())
                .orElseGet(() -> dummyCompanyProfile(user));

        List<CandidateSummary> topCandidates = buildCandidateSummaries();
        List<InterviewerSummary> featuredInterviewers = buildInterviewerSummaries();

        return new CompanyDashboardResponse(
                company.getId(),
                company.getCompanyName(),
                user.getEmail(),
                company.getHiringFocus(),
                topCandidates,
                featuredInterviewers,
                (int) candidates.count(),
                (int) interviewers.count(),
                (int) companies.count()
        );
    }

    private List<CandidateSummary> buildCandidateSummaries() {
        return candidates.findAll().stream()
                .limit(10)
                .map(c -> new CandidateSummary(
                        c.getId(), c.getUser().getFullName(), c.getCurrentLevel(),
                        List.copyOf(c.getSkills()), c.getAverageRating(),
                        c.getCompletedInterviews(), c.getPublicResults()))
                .collect(Collectors.toList());
    }

    private List<InterviewerSummary> buildInterviewerSummaries() {
        return interviewers.findAll().stream()
                .limit(5)
                .map(i -> new InterviewerSummary(
                        i.getId(), i.getUser().getFullName(), i.getRankTitle(),
                        List.copyOf(i.getSkills()), i.getAverageRating(),
                        i.getCompletedInterviews(), i.getPricePerInterview()))
                .collect(Collectors.toList());
    }

    private CandidateProfile dummyCandidateProfile(UserAccount user) {
        return new CandidateProfile(user, "Foundation", java.util.Set.of(), "Preparing for excellence.");
    }

    private CompanyProfile dummyCompanyProfile(UserAccount user) {
        return new CompanyProfile(user, user.getFullName(), "Tech recruitment");
    }
}
