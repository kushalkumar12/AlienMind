package com.interviewtogether.web.dto;

public record ChatDTO(
    Long senderId,
    Long receiverId,
    String content,
    String timestamp,
    String status
) {}
