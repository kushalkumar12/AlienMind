package com.interviewtogether.service;

import com.interviewtogether.domain.*;
import com.interviewtogether.repository.*;
import com.interviewtogether.web.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@DisplayName("PlatformService Tests")
class PlatformServiceTest {

    private PlatformService platformService;

    @Mock
    private UserAccountRepository userRepository;

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

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        platformService = new PlatformService(userRepository, candidateRepository, interviewerRepository,
                companyRepository, sessionRepository, resultRepository);
    }

    @Test
    @DisplayName("Should register candidate successfully")
    void testRegisterCandidate() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
                "John Doe", "john@example.com", "password123", UserRole.CANDIDATE,
                java.util.List.of(), "Java developer", null, null, null, null
        );
        UserAccount savedUser = new UserAccount("John Doe", "john@example.com", "hashed", UserRole.CANDIDATE);
        
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.save(any(UserAccount.class))).thenReturn(savedUser);
        when(candidateRepository.save(any(CandidateProfile.class))).thenReturn(new CandidateProfile());

        // Act
        UserAccount result = platformService.register(request);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getFullName());
        verify(userRepository).save(any(UserAccount.class));
        verify(candidateRepository).save(any(CandidateProfile.class));
    }

    @Test
    @DisplayName("Should throw exception for duplicate email during registration")
    void testRegisterDuplicateEmail() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
                "Jane Doe", "jane@example.com", "password123", UserRole.CANDIDATE,
                java.util.List.of(), "Python developer", null, null, null, null
        );
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> platformService.register(request));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("Email already registered"));
    }

    @Test
    @DisplayName("Should register interviewer successfully")
    void testRegisterInterviewer() {
        // Arrange
        RegisterRequest request = new RegisterRequest(
                "Alice Smith", "alice@example.com", "password123", UserRole.INTERVIEWER,
                java.util.List.of(), null, "Senior", java.math.BigDecimal.valueOf(100.0), null, null
        );
        UserAccount savedUser = new UserAccount("Alice Smith", "alice@example.com", "hashed", UserRole.INTERVIEWER);
        
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(userRepository.save(any(UserAccount.class))).thenReturn(savedUser);
        when(interviewerRepository.save(any(InterviewerProfile.class))).thenReturn(new InterviewerProfile());

        // Act
        UserAccount result = platformService.register(request);

        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(UserAccount.class));
        verify(interviewerRepository).save(any(InterviewerProfile.class));
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        // Arrange
        LoginRequest request = new LoginRequest("user@example.com", "password123");
        UserAccount user = new UserAccount("User Name", "user@example.com", 
                "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", UserRole.CANDIDATE);
        
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));

        // Act
        UserAccount result = platformService.login(request);

        // Assert
        assertNotNull(result);
        assertEquals("user@example.com", result.getEmail());
    }

    @Test
    @DisplayName("Should throw exception for non-existent user during login")
    void testLoginUserNotFound() {
        // Arrange
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password123");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> platformService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    @DisplayName("Should throw exception for invalid password during login")
    void testLoginInvalidPassword() {
        // Arrange
        LoginRequest request = new LoginRequest("user@example.com", "wrongpassword");
        UserAccount user = new UserAccount("User Name", "user@example.com", "hashed", UserRole.CANDIDATE);
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> platformService.login(request));
        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
    }

    @Test
    @DisplayName("Should schedule interview successfully")
    void testScheduleInterview() {
        // Arrange
        ScheduleInterviewRequest request = new ScheduleInterviewRequest(1L, 1L, java.time.Instant.now().plusSeconds(3600));
        CandidateProfile candidate = new CandidateProfile();
        InterviewerProfile interviewer = new InterviewerProfile();
        InterviewSession session = new InterviewSession(candidate, interviewer, request.scheduledAt(), "/interviews/room/123");

        when(candidateRepository.findById(request.candidateId())).thenReturn(Optional.of(candidate));
        when(interviewerRepository.findById(request.interviewerId())).thenReturn(Optional.of(interviewer));
        when(sessionRepository.save(any(InterviewSession.class))).thenReturn(session);

        // Act
        InterviewSession result = platformService.scheduleInterview(request);

        // Assert
        assertNotNull(result);
        verify(sessionRepository).save(any(InterviewSession.class));
    }

    @Test
    @DisplayName("Should throw exception when candidate not found for scheduling")
    void testScheduleInterviewCandidateNotFound() {
        // Arrange
        ScheduleInterviewRequest request = new ScheduleInterviewRequest(999L, 1L, java.time.Instant.now());
        when(candidateRepository.findById(request.candidateId())).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> platformService.scheduleInterview(request));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    @DisplayName("Should submit interview result successfully")
    void testSubmitResult() {
        // Arrange
        ResultRequest request = new ResultRequest(8, 7, 8, "Good performance", "Practice more", null, null);
        CandidateProfile candidate = new CandidateProfile();
        InterviewerProfile interviewer = new InterviewerProfile();
        InterviewSession session = new InterviewSession(candidate, interviewer, java.time.Instant.now(), "/room/123");
        session.setId(1L);

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(resultRepository.save(any(InterviewResult.class))).thenReturn(new InterviewResult());

        // Act
        InterviewResult result = platformService.submitResult(1L, request);

        // Assert
        assertNotNull(result);
        verify(resultRepository).save(any(InterviewResult.class));
    }

    @Test
    @DisplayName("Should throw exception when session not found for result submission")
    void testSubmitResultSessionNotFound() {
        // Arrange
        ResultRequest request = new ResultRequest(8, 7, 8, "Good", "Practice", null, null);
        when(sessionRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, () -> platformService.submitResult(999L, request));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    @DisplayName("Should update candidate visibility successfully")
    void testUpdateCandidateVisibility() {
        // Arrange
        VisibilityRequest request = new VisibilityRequest(true, false);
        CandidateProfile candidate = new CandidateProfile();
        when(candidateRepository.findById(1L)).thenReturn(Optional.of(candidate));

        // Act
        CandidateProfile result = platformService.updateCandidateVisibility(1L, request);

        // Assert
        assertNotNull(result);
        verify(candidateRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when candidate not found for visibility update")
    void testUpdateCandidateVisibilityNotFound() {
        // Arrange
        VisibilityRequest request = new VisibilityRequest(true, false);
        when(candidateRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ApiException exception = assertThrows(ApiException.class, 
            () -> platformService.updateCandidateVisibility(999L, request));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
    }

    @Test
    @DisplayName("Should retrieve dashboard statistics")
    void testDashboard() {
        // Arrange
        when(candidateRepository.count()).thenReturn(10L);
        when(interviewerRepository.count()).thenReturn(5L);
        when(companyRepository.count()).thenReturn(3L);
        when(sessionRepository.count()).thenReturn(20L);
        when(resultRepository.count()).thenReturn(15L);

        // Act
        DashboardResponse result = platformService.dashboard();

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.candidates());
        assertEquals(5L, result.interviewers());
        assertEquals(3L, result.companies());
        assertEquals(20L, result.interviews());
        assertEquals(15L, result.results());
    }
}
