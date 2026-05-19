package com.interviewtogether.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record ResultRequest(
        @Min(1) @Max(10) Integer candidateScore,
        @Min(1) @Max(10) Integer communicationScore,
        @Min(1) @Max(10) Integer technicalScore,
        @NotBlank String feedback,
        @NotBlank String improvementAreas,
        String recordingUrl,
        String voiceTranscript
) {
}
