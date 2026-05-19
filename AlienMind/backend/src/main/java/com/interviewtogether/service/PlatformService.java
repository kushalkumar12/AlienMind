package com.interviewtogether.service;

import com.interviewtogether.domain.*;
import com.interviewtogether.repository.*;
import com.interviewtogether.web.dto.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlatformService {
    private final UserAccountRepository users;
    private final CandidateProfileRepository candidates;
    private final InterviewerProfileRepository interviewers;
    private final CompanyProfileRepository companies;
    private final InterviewSessionRepository sessions;
    private final InterviewResultRepository results;

    public PlatformService(UserAccountRepository users, CandidateProfileRepository candidates,
                           InterviewerProfileRepository interviewers, CompanyProfileRepository companies,
                           InterviewSessionRepository sessions, InterviewResultRepository results) {
        this.users = users;
        this.candidates = candidates;
        this.interviewers = interviewers;
        this.companies = companies;
        this.sessions = sessions;
        this.results = results;
    }

    @Transactional
    public UserAccount register(RegisterRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        UserAccount user = users.save(new UserAccount(
                request.fullName(),
                request.email(),
                hash(request.password()),
                request.role()
        ));

        if (request.role() == UserRole.CANDIDATE) {
            candidates.save(new CandidateProfile(user, "Foundation", new LinkedHashSet<>(request.skills()), request.summary()));
        } else if (request.role() == UserRole.INTERVIEWER) {
            interviewers.save(new InterviewerProfile(user, request.rankTitle(), request.pricePerInterview(), new LinkedHashSet<>(request.skills())));
        } else if (request.role() == UserRole.COMPANY) {
            companies.save(new CompanyProfile(user, request.companyName(), request.hiringFocus()));
        }

        return user;
    }

    @Transactional
    public UserAccount login(LoginRequest request, String ip, String sessionId) {
        UserAccount user = users.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!user.getPasswordHash().equals(hash(request.password()))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        
        user.setLastIp(ip);
        user.setLastSessionId(sessionId);
        user.setActive(true);
        return users.save(user);
    }

    @Transactional
    public InterviewSession scheduleInterview(ScheduleInterviewRequest request) {
        CandidateProfile candidate = candidates.findById(java.util.Objects.requireNonNull(request.candidateId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Candidate not found"));
        InterviewerProfile interviewer = interviewers.findById(java.util.Objects.requireNonNull(request.interviewerId()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Interviewer not found"));
        String roomUrl = "/interviews/room/" + System.currentTimeMillis();
        return sessions.save(new InterviewSession(candidate, interviewer, request.scheduledAt(), roomUrl));
    }

    @Transactional
    public InterviewResult submitResult(Long sessionId, ResultRequest request) {
        InterviewSession session = sessions.findById(java.util.Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Interview session not found"));
        session.complete(request.recordingUrl(), request.voiceTranscript());
        session.getCandidate().applyRating(request.candidateScore());
        return results.save(new InterviewResult(
                session,
                request.candidateScore(),
                request.communicationScore(),
                request.technicalScore(),
                request.feedback(),
                request.improvementAreas()
        ));
    }

    @Transactional
    public CandidateProfile updateCandidateVisibility(Long candidateId, VisibilityRequest request) {
        CandidateProfile candidate = candidates.findById(java.util.Objects.requireNonNull(candidateId))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Candidate not found"));
        candidate.updateVisibility(request.publicResults(), request.publicRecordings());
        return candidate;
    }

    public DashboardResponse dashboard() {
        return new DashboardResponse(candidates.count(), interviewers.count(), companies.count(), sessions.count(), results.count());
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
