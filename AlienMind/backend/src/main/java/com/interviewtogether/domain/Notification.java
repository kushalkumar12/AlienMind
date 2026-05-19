package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private UserAccount user;

    @Column(nullable = false)
    private String title;

    private String message;
    private String type; // ALERT, AI, CONNECTION, HIRING
    
    private boolean isRead = false;
    
    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public Notification() {}

    public Notification(UserAccount user, String title, String message, String type) {
        this.user = user;
        this.title = title;
        this.message = message;
        this.type = type;
    }

    public Long getId() { return id; }
    public UserAccount getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public boolean isRead() { return isRead; }
    public Instant getCreatedAt() { return createdAt; }
}
