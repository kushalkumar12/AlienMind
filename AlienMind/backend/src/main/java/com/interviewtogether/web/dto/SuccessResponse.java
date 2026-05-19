package com.interviewtogether.web.dto;

import java.time.Instant;

public record SuccessResponse<T>(
        int status,
        String message,
        T data,
        Instant timestamp
) {
}
