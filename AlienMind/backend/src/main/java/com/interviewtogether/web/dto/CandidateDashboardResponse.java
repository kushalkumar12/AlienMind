package com.interviewtogether.web.dto;

import com.interviewtogether.domain.UserRole;
import java.util.List;

public record CandidateDashboardResponse(
    Long profileId,
    Long userId,
    String fullName,
    String email,
    String currentLevel,
    List<String> skills,
    String summary,
    Double averageRating,
    Integer completedInterviews,
    Boolean publicResults,
    Boolean publicRecordings,
    
    // New Dynamic Data Fields
    List<JobPostDTO> trendingJobs,
    List<NotificationDTO> recentNotifications,
    List<InterviewDTO> upcomingInterviews,
    List<ConnectionDTO> connections,
    List<MessageDTO> recentMessages,
    AnalyticsDTO analytics,
    NetworkingInsightsDTO networkingInsights
) {
    public record JobPostDTO(Long id, String title, String companyName, String siteName, String postedAt) {}
    public record NotificationDTO(Long id, String title, String message, String type, boolean isRead, String time) {}
    public record InterviewDTO(Long id, String interviewerName, String status, String scheduledAt, String roomUrl) {}
    public record ConnectionDTO(
        Long id, 
        String name, 
        String role, 
        String avatarColor, 
        String status, 
        Long connectionId,
        Boolean isRequester,
        List<String> expertise,
        Integer skillMatch,
        Integer aiCompatibility,
        String experienceLevel,
        String availability,
        Integer mutualConnections
    ) {}
    public record MessageDTO(Long id, String partnerName, String lastMessage, String time) {}
    public record AnalyticsDTO(
        Integer readinessScore,
        Double successRate,
        String globalRank,
        List<TrendPointDTO> trend,
        List<SkillPerformanceDTO> skillPerformance
    ) {}
    public record TrendPointDTO(String label, Integer score) {}
    public record SkillPerformanceDTO(String name, Integer score, String trend) {}
    public record NetworkingInsightsDTO(
        Integer suggestedMentors,
        Integer suggestedPartners,
        Integer matchRate,
        Integer activeSessions
    ) {}
}
