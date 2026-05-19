package com.interviewtogether.repository;

import com.interviewtogether.domain.InterviewSession;
import com.interviewtogether.domain.InterviewStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findByCandidateId(Long candidateId);

    List<InterviewSession> findByInterviewerId(Long interviewerId);

    long countByStatus(InterviewStatus status);
}
