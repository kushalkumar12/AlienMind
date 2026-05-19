package com.interviewtogether.web.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record ScheduleInterviewRequest(
        @NotNull Long candidateId,
        @NotNull Long interviewerId,
        @NotNull Instant scheduledAt
) {
}
