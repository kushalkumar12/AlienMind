package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class InterviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private CandidateProfile candidate;

    @ManyToOne(optional = false)
    private InterviewerProfile interviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewStatus status = InterviewStatus.REQUESTED;

    @Column(nullable = false)
    private Instant scheduledAt;

    @Column(nullable = false)
    private String roomUrl;

    private String recordingUrl;

    @Column(length = 5000)
    private String voiceTranscript;

    protected InterviewSession() {
    }

    public InterviewSession(CandidateProfile candidate, InterviewerProfile interviewer, Instant scheduledAt, String roomUrl) {
        this.candidate = candidate;
        this.interviewer = interviewer;
        this.scheduledAt = scheduledAt;
        this.roomUrl = roomUrl;
        this.status = InterviewStatus.SCHEDULED;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CandidateProfile getCandidate() {
        return candidate;
    }

    public InterviewerProfile getInterviewer() {
        return interviewer;
    }

    public InterviewStatus getStatus() {
        return status;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public String getRoomUrl() {
        return roomUrl;
    }

    public String getRecordingUrl() {
        return recordingUrl;
    }

    public String getVoiceTranscript() {
        return voiceTranscript;
    }

    public void complete(String recordingUrl, String voiceTranscript) {
        this.status = InterviewStatus.COMPLETED;
        this.recordingUrl = recordingUrl;
        this.voiceTranscript = voiceTranscript;
    }
}
