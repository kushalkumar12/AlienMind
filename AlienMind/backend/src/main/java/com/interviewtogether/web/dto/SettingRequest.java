package com.interviewtogether.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SettingRequest(
        @NotBlank String value,
        @NotNull Boolean publicSetting
) {
}
