package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class InterviewResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private InterviewSession session;

    private Integer candidateScore;
    private Integer communicationScore;
    private Integer technicalScore;

    @Column(length = 1800)
    private String feedback;

    @Column(length = 1200)
    private String improvementAreas;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public InterviewResult() {
    }

    public InterviewResult(InterviewSession session, Integer candidateScore, Integer communicationScore,
                           Integer technicalScore, String feedback, String improvementAreas) {
        this.session = session;
        this.candidateScore = candidateScore;
        this.communicationScore = communicationScore;
        this.technicalScore = technicalScore;
        this.feedback = feedback;
        this.improvementAreas = improvementAreas;
    }

    public Long getId() {
        return id;
    }

    public InterviewSession getSession() {
        return session;
    }

    public Integer getCandidateScore() {
        return candidateScore;
    }

    public Integer getCommunicationScore() {
        return communicationScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public String getFeedback() {
        return feedback;
    }

    public String getImprovementAreas() {
        return improvementAreas;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
