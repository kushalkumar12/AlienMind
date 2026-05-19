package com.interviewtogether.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AdminSettingResponse(
        String key,
        String value,
        Boolean publicSetting,
        String iconData,
        Long updatedAt
) {
}
