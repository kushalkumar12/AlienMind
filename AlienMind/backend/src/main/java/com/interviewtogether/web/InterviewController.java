package com.interviewtogether.web;

import com.interviewtogether.service.DashboardService;
import com.interviewtogether.web.dto.InterviewRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/interviews")
public class InterviewController {

    private final DashboardService dashboardService;

    public InterviewController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @PostMapping("/request")
    public ResponseEntity<Void> requestInterview(@RequestBody InterviewRequestDTO dto) {
        dashboardService.requestInterview(dto);
        return ResponseEntity.ok().build();
    }
}
