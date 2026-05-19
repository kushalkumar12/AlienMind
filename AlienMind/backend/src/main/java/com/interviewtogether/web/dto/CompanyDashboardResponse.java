package com.interviewtogether.web.dto;

import java.util.List;

public record CompanyDashboardResponse(
        Long profileId,
        String companyName,
        String contactEmail,
        String hiringFocus,
        // Available talent pool
        List<CandidateSummary> topCandidates,
        List<InterviewerSummary> featuredInterviewers,
        // Platform-wide stats
        long totalCandidates,
        long totalInterviewers,
        long totalCompanies
) {
    public record CandidateSummary(
            Long id,
            String name,
            String level,
            List<String> skills,
            Double rating,
            Integer sessions,
            boolean publicResults
    ) {}

    public record InterviewerSummary(
            Long id,
            String name,
            String rankTitle,
            List<String> skills,
            Double rating,
            Integer sessions,
            java.math.BigDecimal pricePerInterview
    ) {}
}
