package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.config.RequireRole;
import com.promonts.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {
    
    private final StatisticsService statisticsService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/admin")
    @RequireRole({"ADMIN"})
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        return ResponseEntity.ok(statisticsService.getAdminStats());
    }
    
    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getUserStats(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        return ResponseEntity.ok(statisticsService.getUserStats(userId));
    }
}
