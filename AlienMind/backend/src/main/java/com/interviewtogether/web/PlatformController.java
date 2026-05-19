package com.interviewtogether.web;

import com.interviewtogether.domain.*;
import com.interviewtogether.repository.*;
import com.interviewtogether.service.ConnectionService;
import com.interviewtogether.service.PlatformService;
import com.interviewtogether.web.dto.*;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PlatformController {
    private final PlatformService platformService;
    private final CandidateProfileRepository candidates;
    private final InterviewerProfileRepository interviewers;
    private final CompanyProfileRepository companies;
    private final InterviewSessionRepository sessions;
    private final InterviewResultRepository results;
    private final UserAccountRepository users;
    private final ConnectionService connectionService;

    public PlatformController(PlatformService platformService, CandidateProfileRepository candidates,
                              InterviewerProfileRepository interviewers, CompanyProfileRepository companies,
                              InterviewSessionRepository sessions, InterviewResultRepository results,
                              UserAccountRepository users, ConnectionService connectionService) {
        this.platformService = platformService;
        this.candidates = candidates;
        this.interviewers = interviewers;
        this.companies = companies;
        this.sessions = sessions;
        this.results = results;
        this.users = users;
        this.connectionService = connectionService;
    }

    @GetMapping("/users/search")
    public SuccessResponse<List<AdminUserResponse>> searchUsers(@RequestParam String q, @RequestParam(required = false) Long currentUserId) {
        List<AdminUserResponse> resultsList = users.findByFullNameContainingIgnoreCase(q).stream()
                .limit(10)
                .map(u -> {
                    int mutualCount = (currentUserId != null) ? connectionService.getMutualConnectionCount(currentUserId, u.getId()) : 0;
                    
                    // Simulate premium insights for the demo
                    List<String> expertise = List.of("Java", "Spring", "Architecture");
                    int skillMatch = 70 + (u.getId().intValue() % 25);
                    int aiCompatibility = 65 + (u.getId().intValue() % 30);
                    String expLevel = u.getId() % 3 == 0 ? "Senior" : "Mid";
                    String availability = u.getId() % 4 == 0 ? "Busy" : "Available";

                    return new AdminUserResponse(
                        u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getCreatedAt(), 
                        mutualCount, expertise, skillMatch, aiCompatibility, expLevel, availability
                    );
                })
                .collect(Collectors.toList());
        
        return new SuccessResponse<>(200, "Search results", resultsList, Instant.now());
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return platformService.dashboard();
    }

    @GetMapping("/candidates")
    public List<CandidateProfile> candidates() {
        return candidates.findAll();
    }

    @PatchMapping("/candidates/{candidateId}/visibility")
    public CandidateProfile updateCandidateVisibility(@PathVariable Long candidateId, @Valid @RequestBody VisibilityRequest request) {
        return platformService.updateCandidateVisibility(candidateId, request);
    }

    @GetMapping("/interviewers")
    public List<InterviewerProfile> interviewers() {
        return interviewers.findAll();
    }

    @GetMapping("/companies")
    public List<CompanyProfile> companies() {
        return companies.findAll();
    }

    @PostMapping("/interviews")
    public InterviewSession scheduleInterview(@Valid @RequestBody ScheduleInterviewRequest request) {
        return platformService.scheduleInterview(request);
    }

    @GetMapping("/interviews")
    public List<InterviewSession> interviews() {
        return sessions.findAll();
    }

    @PostMapping("/interviews/{sessionId}/result")
    public InterviewResult submitResult(@PathVariable Long sessionId, @Valid @RequestBody ResultRequest request) {
        return platformService.submitResult(sessionId, request);
    }

    @GetMapping("/candidates/{candidateId}/results")
    public List<InterviewResult> candidateResults(@PathVariable Long candidateId) {
        return results.findBySession_Candidate_Id(candidateId);
    }
}
