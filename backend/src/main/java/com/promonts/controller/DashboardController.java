package com.promonts.controller;
import com.promonts.dto.DashboardResponse;
import com.promonts.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        String userEmail = authentication.getName();
        DashboardResponse dashboard = dashboardService.getDashboard(userEmail);
        return ResponseEntity.ok(dashboard);
    }
}
