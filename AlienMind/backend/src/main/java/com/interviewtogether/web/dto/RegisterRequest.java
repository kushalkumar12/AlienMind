package com.interviewtogether.web.dto;

import com.interviewtogether.domain.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank String email,
        @NotBlank String password,
        @NotNull UserRole role,
        List<String> skills,
        String summary,
        String rankTitle,
        BigDecimal pricePerInterview,
        String companyName,
        String hiringFocus
) {
    public RegisterRequest {
        skills = skills == null ? List.of() : skills;
        rankTitle = rankTitle == null ? "Verified Interviewer" : rankTitle;
        pricePerInterview = pricePerInterview == null ? BigDecimal.ZERO : pricePerInterview;
        companyName = companyName == null ? fullName : companyName;
    }
}
