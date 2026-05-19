package com.interviewtogether.repository;

import com.interviewtogether.domain.InterviewResult;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InterviewResultRepository extends JpaRepository<InterviewResult, Long> {
    List<InterviewResult> findBySession_Candidate_Id(Long candidateId);
}
