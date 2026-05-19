package com.interviewtogether.web.dto;

import com.interviewtogether.domain.UserRole;
import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        UserRole role,
        Instant createdAt,
        Integer mutualConnections,
        java.util.List<String> expertise,
        Integer skillMatch,
        Integer aiCompatibility,
        String experienceLevel,
        String availability
) {
}
