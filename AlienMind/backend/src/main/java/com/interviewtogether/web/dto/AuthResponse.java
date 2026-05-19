package com.interviewtogether.web.dto;

import com.interviewtogether.domain.UserRole;

public record AuthResponse(
        Long id,
        String fullName,
        String email,
        UserRole role
) {
}
