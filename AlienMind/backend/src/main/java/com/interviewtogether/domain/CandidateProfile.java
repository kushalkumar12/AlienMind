package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class CandidateProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private UserAccount user;

    @Column(nullable = false)
    private String currentLevel;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> skills = new LinkedHashSet<>();

    @Column(length = 1200)
    private String summary;

    private Double averageRating = 0.0;
    private Integer completedInterviews = 0;
    private Boolean publicResults = true;
    private Boolean publicRecordings = false;

    public CandidateProfile() {
    }

    public CandidateProfile(UserAccount user, String currentLevel, Set<String> skills, String summary) {
        this.user = user;
        this.currentLevel = currentLevel;
        this.skills = skills;
        this.summary = summary;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public String getCurrentLevel() {
        return currentLevel;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public String getSummary() {
        return summary;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getCompletedInterviews() {
        return completedInterviews;
    }

    public Boolean getPublicResults() {
        return publicResults;
    }

    public Boolean getPublicRecordings() {
        return publicRecordings;
    }

    public void updateVisibility(Boolean publicResults, Boolean publicRecordings) {
        this.publicResults = publicResults;
        this.publicRecordings = publicRecordings;
    }

    public void applyRating(int score) {
        double total = averageRating * completedInterviews;
        completedInterviews++;
        averageRating = (total + score) / completedInterviews;
    }
}
