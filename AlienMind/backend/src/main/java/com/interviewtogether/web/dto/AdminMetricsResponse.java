package com.interviewtogether.web.dto;

public record AdminMetricsResponse(
        long totalUsers,
        long candidates,
        long companies,
        long interviewers,
        long completedSessions,
        long activeSessions,
        long totalResults
) {
}
