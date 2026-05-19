package com.interviewtogether.web;

import com.interviewtogether.domain.*;
import com.interviewtogether.repository.*;
import com.interviewtogether.service.ConnectionService;
import com.interviewtogether.service.PlatformService;
import com.interviewtogether.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.ArgumentMatchers;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("PlatformController Tests")
class PlatformControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PlatformService platformService;

    @Mock
    private CandidateProfileRepository candidateRepository;

    @Mock
    private InterviewerProfileRepository interviewerRepository;

    @Mock
    private CompanyProfileRepository companyRepository;

    @Mock
    private InterviewSessionRepository sessionRepository;

    @Mock
    private InterviewResultRepository resultRepository;

    @Mock
    private UserAccountRepository userRepository;

    @Mock
    private ConnectionService connectionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(new PlatformController(
                platformService, candidateRepository, interviewerRepository,
                companyRepository, sessionRepository, resultRepository, userRepository,
                connectionService
        )).build();
    }

    @Test
    @DisplayName("Should retrieve dashboard statistics")
    void testGetDashboard() throws Exception {
        // Arrange
        DashboardResponse dashboard = new DashboardResponse(10L, 5L, 3L, 20L, 15L);
        when(platformService.dashboard()).thenReturn(dashboard);

        // Act & Assert
        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidates", is(10)))
                .andExpect(jsonPath("$.interviewers", is(5)))
                .andExpect(jsonPath("$.companies", is(3)))
                .andExpect(jsonPath("$.interviews", is(20)))
                .andExpect(jsonPath("$.results", is(15)));
    }

    @Test
    @DisplayName("Should retrieve all candidates")
    void testGetCandidates() throws Exception {
        // Arrange
        List<CandidateProfile> candidates = new ArrayList<>();
        candidates.add(new CandidateProfile());
        candidates.add(new CandidateProfile());
        when(candidateRepository.findAll()).thenReturn(candidates);

        // Act & Assert
        mockMvc.perform(get("/api/candidates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("Should update candidate visibility successfully")
    void testUpdateCandidateVisibility() throws Exception {
        // Arrange
        CandidateProfile candidate = new CandidateProfile();
        VisibilityRequest request = new VisibilityRequest(true, false);
        when(platformService.updateCandidateVisibility(ArgumentMatchers.eq(1L), ArgumentMatchers.any(VisibilityRequest.class))).thenReturn(candidate);

        // Act & Assert
        mockMvc.perform(patch("/api/candidates/1/visibility")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"publicResults\":true,\"publicRecordings\":false}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should retrieve all interviewers")
    void testGetInterviewers() throws Exception {
        // Arrange
        List<InterviewerProfile> interviewers = new ArrayList<>();
        interviewers.add(new InterviewerProfile());
        when(interviewerRepository.findAll()).thenReturn(interviewers);

        // Act & Assert
        mockMvc.perform(get("/api/interviewers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("Should retrieve all companies")
    void testGetCompanies() throws Exception {
        // Arrange
        List<CompanyProfile> companies = new ArrayList<>();
        companies.add(new CompanyProfile());
        when(companyRepository.findAll()).thenReturn(companies);

        // Act & Assert
        mockMvc.perform(get("/api/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("Should schedule interview successfully")
    void testScheduleInterview() throws Exception {
        // Arrange
        Instant scheduledTime = Instant.now().plusSeconds(3600);
        InterviewSession session = new InterviewSession(
                new CandidateProfile(), new InterviewerProfile(), 
                scheduledTime, "/interviews/room/123"
        );
        session.setId(1L);
        when(platformService.scheduleInterview(ArgumentMatchers.any(ScheduleInterviewRequest.class))).thenReturn(session);

        // Act & Assert
        mockMvc.perform(post("/api/interviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"candidateId\":1,\"interviewerId\":1,\"scheduledAt\":\"" + scheduledTime + "\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should retrieve all interview sessions")
    void testGetInterviews() throws Exception {
        // Arrange
        List<InterviewSession> sessions = new ArrayList<>();
        sessions.add(new InterviewSession(
                new CandidateProfile(), new InterviewerProfile(),
                Instant.now(), "/room/1"
        ));
        when(sessionRepository.findAll()).thenReturn(sessions);

        // Act & Assert
        mockMvc.perform(get("/api/interviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("Should submit interview result successfully")
    void testSubmitResult() throws Exception {
        // Arrange
        InterviewResult result = new InterviewResult();
        when(platformService.submitResult(ArgumentMatchers.eq(1L), ArgumentMatchers.any(ResultRequest.class))).thenReturn(result);

        // Act & Assert
        mockMvc.perform(post("/api/interviews/1/result")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"candidateScore\":8,\"communicationScore\":7," +
                        "\"technicalScore\":8,\"feedback\":\"Good\",\"improvementAreas\":\"Practice\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should retrieve candidate results by candidate ID")
    void testGetCandidateResults() throws Exception {
        // Arrange
        List<InterviewResult> results = new ArrayList<>();
        results.add(new InterviewResult());
        when(resultRepository.findBySession_Candidate_Id(1L)).thenReturn(results);

        // Act & Assert
        mockMvc.perform(get("/api/candidates/1/results"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
}
