package com.interviewtogether.web.dto;

import jakarta.validation.constraints.NotNull;

public record VisibilityRequest(
        @NotNull Boolean publicResults,
        @NotNull Boolean publicRecordings
) {
}
