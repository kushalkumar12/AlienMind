package com.interviewtogether.repository;

import com.interviewtogether.domain.CandidateProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, Long> {
    Optional<CandidateProfile> findByUserId(Long userId);
    long countByAverageRatingGreaterThan(Double rating);
}

