package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class UserConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private UserAccount requester;

    @ManyToOne(optional = false)
    private UserAccount receiver;

    private String status; // PENDING, ACCEPTED

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public UserConnection() {}

    public UserConnection(UserAccount requester, UserAccount receiver, String status) {
        this.requester = requester;
        this.receiver = receiver;
        this.status = status;
    }

    public Long getId() { return id; }
    public UserAccount getRequester() { return requester; }
    public UserAccount getReceiver() { return receiver; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setStatus(String status) { this.status = status; }
}
