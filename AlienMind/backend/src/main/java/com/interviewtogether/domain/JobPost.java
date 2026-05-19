package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @ManyToOne(optional = false)
    private CompanyProfile company;

    private String siteName;
    
    @Column(nullable = false)
    private Instant postedAt = Instant.now();

    public JobPost() {}

    public JobPost(String title, String description, CompanyProfile company, String siteName) {
        this.title = title;
        this.description = description;
        this.company = company;
        this.siteName = siteName;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public CompanyProfile getCompany() { return company; }
    public String getSiteName() { return siteName; }
    public Instant getPostedAt() { return postedAt; }
}
