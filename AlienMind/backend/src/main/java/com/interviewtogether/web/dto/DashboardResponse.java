package com.interviewtogether.web.dto;

public record DashboardResponse(
        long candidates,
        long interviewers,
        long companies,
        long interviews,
        long results
) {
}
