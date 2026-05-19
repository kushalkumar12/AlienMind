package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
public class InterviewerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    private UserAccount user;

    @Column(nullable = false)
    private String rankTitle;

    @Column(nullable = false)
    private BigDecimal pricePerInterview;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> skills = new LinkedHashSet<>();

    private Double averageRating = 0.0;
    private Integer completedInterviews = 0;

    public InterviewerProfile() {
    }

    public InterviewerProfile(UserAccount user, String rankTitle, BigDecimal pricePerInterview, Set<String> skills) {
        this.user = user;
        this.rankTitle = rankTitle;
        this.pricePerInterview = pricePerInterview;
        this.skills = skills;
    }

    public Long getId() {
        return id;
    }

    public UserAccount getUser() {
        return user;
    }

    public String getRankTitle() {
        return rankTitle;
    }

    public BigDecimal getPricePerInterview() {
        return pricePerInterview;
    }

    public Set<String> getSkills() {
        return skills;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getCompletedInterviews() {
        return completedInterviews;
    }
}
