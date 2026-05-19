package com.interviewtogether.web;

import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.domain.UserRole;
import com.interviewtogether.service.PlatformService;
import com.interviewtogether.web.dto.AuthResponse;
import com.interviewtogether.web.dto.LoginRequest;
import com.interviewtogether.web.dto.RegisterRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("AuthController Tests")
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PlatformService platformService;

    private UserAccount testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(platformService)).build();
        
        testUser = new UserAccount("John Doe", "john@example.com", "hashed", UserRole.CANDIDATE);
        testUser.setId(1L);
        registerRequest = new RegisterRequest(
                "John Doe", "john@example.com", "password123", UserRole.CANDIDATE,
                List.of(), "Summary", null, null, null, null
        );
        loginRequest = new LoginRequest("john@example.com", "password123");
    }

    @Test
    @DisplayName("Should register user successfully")
    void testRegisterSuccess() throws Exception {
        // Arrange
        when(platformService.register(any(RegisterRequest.class))).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"," +
                        "\"role\":\"CANDIDATE\",\"skills\":[],\"summary\":\"Summary\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")))
                .andExpect(jsonPath("$.data.email", is("john@example.com")))
                .andExpect(jsonPath("$.data.role", is("CANDIDATE")));
    }

    @Test
    @DisplayName("Should login user successfully")
    void testLoginSuccess() throws Exception {
        // Arrange
        when(platformService.login(any(LoginRequest.class))).thenReturn(testUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"john@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id", is(1)))
                .andExpect(jsonPath("$.data.fullName", is("John Doe")))
                .andExpect(jsonPath("$.data.email", is("john@example.com")))
                .andExpect(jsonPath("$.data.role", is("CANDIDATE")));
    }

    @Test
    @DisplayName("Should return interviewer role in login response")
    void testLoginInterviewer() throws Exception {
        // Arrange
        UserAccount interviewerUser = new UserAccount("Jane Smith", "jane@example.com", "hashed", UserRole.INTERVIEWER);
        interviewerUser.setId(2L);
        when(platformService.login(any(LoginRequest.class))).thenReturn(interviewerUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"jane@example.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role", is("INTERVIEWER")));
    }

    @Test
    @DisplayName("Should return company role in registration response")
    void testRegisterCompany() throws Exception {
        // Arrange
        UserAccount companyUser = new UserAccount("Company Name", "company@example.com", "hashed", UserRole.COMPANY);
        companyUser.setId(3L);
        when(platformService.register(any(RegisterRequest.class))).thenReturn(companyUser);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Company Name\",\"email\":\"company@example.com\",\"password\":\"pass123\"," +
                        "\"role\":\"COMPANY\",\"companyName\":\"TechCorp\",\"hiringFocus\":\"Java\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.role", is("COMPANY")));
    }

    @Test
    @DisplayName("Should return correct user information in response")
    void testAuthResponseContainsCorrectData() throws Exception {
        // Arrange
        UserAccount user = new UserAccount("Test User", "test@example.com", "hash", UserRole.CANDIDATE);
        user.setId(5L);
        when(platformService.register(any(RegisterRequest.class))).thenReturn(user);

        // Act & Assert
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fullName\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"pass123\"," +
                        "\"role\":\"CANDIDATE\",\"skills\":[]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(5)))
                .andExpect(jsonPath("$.data.fullName", is("Test User")))
                .andExpect(jsonPath("$.data.email", is("test@example.com")));
    }
}
