package com.interviewtogether.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record UpdateSettingRequest(
        @NotBlank String value,
        @NotNull Boolean publicSetting,
        String iconData
) {
}
