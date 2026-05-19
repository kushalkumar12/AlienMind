package com.interviewtogether.service;

import com.interviewtogether.domain.InterviewStatus;
import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.repository.*;
import com.interviewtogether.web.dto.AdminMetricsResponse;
import com.interviewtogether.web.dto.AdminUserResponse;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service layer for admin-only operations.
 * Follows Single Responsibility Principle — kept separate from PlatformService.
 */
@Service
public class AdminService {

    private final UserAccountRepository users;
    private final CandidateProfileRepository candidates;
    private final InterviewerProfileRepository interviewers;
    private final CompanyProfileRepository companies;
    private final InterviewSessionRepository sessions;
    private final InterviewResultRepository results;

    public AdminService(
            UserAccountRepository users,
            CandidateProfileRepository candidates,
            InterviewerProfileRepository interviewers,
            CompanyProfileRepository companies,
            InterviewSessionRepository sessions,
            InterviewResultRepository results) {
        this.users = users;
        this.candidates = candidates;
        this.interviewers = interviewers;
        this.companies = companies;
        this.sessions = sessions;
        this.results = results;
    }

    /**
     * Returns all user accounts as safe admin DTOs (no password hash exposed).
     */
    public List<AdminUserResponse> listAllUsers() {
        return users.findAll().stream()
                .map(this::toAdminUserResponse)
                .toList();
    }

    /**
     * Returns aggregate platform metrics for the admin reports panel.
     */
    public AdminMetricsResponse getMetrics() {
        long totalUsers      = users.count();
        long candidateCount  = candidates.count();
        long companyCount    = companies.count();
        long interviewerCount = interviewers.count();
        long totalSessions    = sessions.count();
        long completedSessions = sessions.countByStatus(InterviewStatus.COMPLETED);
        long totalResults    = results.count();

        return new AdminMetricsResponse(
                totalUsers,
                candidateCount,
                companyCount,
                interviewerCount,
                completedSessions,
                totalSessions - completedSessions,
                totalResults
        );
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private AdminUserResponse toAdminUserResponse(UserAccount user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                0, // mutualConnections
                List.of(), // expertise
                0, // skillMatch
                0, // aiCompatibility
                "N/A", // experienceLevel
                "Offline" // availability
        );
    }
}
