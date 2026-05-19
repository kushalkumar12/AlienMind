package com.interviewtogether.web;

import com.interviewtogether.service.DashboardService;
import com.interviewtogether.web.dto.CandidateDashboardResponse;
import com.interviewtogether.web.dto.CompanyDashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for user-specific dashboards.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/candidate")
    public ResponseEntity<CandidateDashboardResponse> getCandidateDashboard(@RequestParam String email) {
        return ResponseEntity.ok(dashboardService.candidateDashboard(email));
    }

    @GetMapping("/company")
    public ResponseEntity<CompanyDashboardResponse> getCompanyDashboard(@RequestParam String email) {
        return ResponseEntity.ok(dashboardService.companyDashboard(email));
    }
}
