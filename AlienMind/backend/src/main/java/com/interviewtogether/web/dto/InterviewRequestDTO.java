package com.interviewtogether.web.dto;

public class InterviewRequestDTO {
    private String email;
    private String skill;
    private String role;
    private String scheduledAt;

    public InterviewRequestDTO() {}

    public InterviewRequestDTO(String email, String skill, String role, String scheduledAt) {
        this.email = email;
        this.skill = skill;
        this.role = role;
        this.scheduledAt = scheduledAt;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }
}
