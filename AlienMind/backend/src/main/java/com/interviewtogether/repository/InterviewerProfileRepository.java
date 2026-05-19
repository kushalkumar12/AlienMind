package com.interviewtogether.repository;

import com.interviewtogether.domain.InterviewerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewerProfileRepository extends JpaRepository<InterviewerProfile, Long> {
}
