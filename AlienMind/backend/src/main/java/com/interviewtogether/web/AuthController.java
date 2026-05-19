package com.interviewtogether.web;

import com.interviewtogether.domain.UserAccount;
import com.interviewtogether.service.PlatformService;
import com.interviewtogether.web.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final PlatformService platformService;

    public AuthController(PlatformService platformService) {
        this.platformService = platformService;
    }

    @PostMapping("/register")
    public ResponseEntity<SuccessResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserAccount user = platformService.register(request);
        AuthResponse response = toResponse(user);
        SuccessResponse<AuthResponse> successResponse = new SuccessResponse<>(
                201,
                "Account created successfully! Welcome to " + request.role().name().toLowerCase() + " community.",
                response,
                Instant.now()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(successResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<SuccessResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String ip = servletRequest.getRemoteAddr();
        String sessionId = servletRequest.getSession().getId();
        UserAccount user = platformService.login(request, ip, sessionId);
        AuthResponse response = toResponse(user);
        SuccessResponse<AuthResponse> successResponse = new SuccessResponse<>(
                200,
                "Login successful! Welcome back.",
                response,
                Instant.now()
        );
        return ResponseEntity.ok(successResponse);
    }

    private AuthResponse toResponse(UserAccount user) {
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole());
    }
}
