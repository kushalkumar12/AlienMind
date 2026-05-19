package com.interviewtogether.web;

import com.interviewtogether.service.AdminService;
import com.interviewtogether.web.dto.AdminMetricsResponse;
import com.interviewtogether.web.dto.AdminUserResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-only REST controller.
 * All endpoints are under /api/admin — easy to lock down with a security filter later.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /**
     * GET /api/admin/users
     * Returns all platform users (id, name, email, role, createdAt — no password).
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> listUsers() {
        return ResponseEntity.ok(adminService.listAllUsers());
    }

    /**
     * GET /api/admin/metrics
     * Returns live aggregate counts for the reports dashboard.
     */
    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> metrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }
}
