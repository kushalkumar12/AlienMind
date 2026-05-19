package com.interviewtogether.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private UserAccount sender;

    @ManyToOne(optional = false)
    private UserAccount receiver;

    @Column(nullable = false, length = 5000)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'SENT'")
    private MessageStatus status = MessageStatus.SENT;

    public enum MessageStatus {
        SENT, DELIVERED, SEEN
    }

    public ChatMessage() {}

    public ChatMessage(UserAccount sender, UserAccount receiver, String content) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.status = MessageStatus.SENT;
    }

    public Long getId() { return id; }
    public UserAccount getSender() { return sender; }
    public UserAccount getReceiver() { return receiver; }
    public String getContent() { return content; }
    public Instant getCreatedAt() { return createdAt; }
    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }
}
