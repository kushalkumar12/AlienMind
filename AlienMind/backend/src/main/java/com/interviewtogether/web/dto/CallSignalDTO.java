package com.interviewtogether.web.dto;

public record CallSignalDTO(
    Long senderId,
    Long receiverId,
    String type, // AUDIO, VIDEO
    String action, // INITIATE, ACCEPT, REJECT, HANGUP, OFFER, ANSWER, ICE
    String senderName,
    String data // JSON string for WebRTC SDP/ICE candidates
) {}
