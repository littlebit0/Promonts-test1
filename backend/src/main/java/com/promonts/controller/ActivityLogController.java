package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.config.RequireRole;
import com.promonts.domain.log.ActivityLog;
import com.promonts.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class ActivityLogController {
    
    private final ActivityLogService logService;
    private final JwtUtil jwtUtil;
    
    @GetMapping("/my")
    public ResponseEntity<List<ActivityLog>> getMyLogs(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<ActivityLog> logs = logService.getUserLogs(userId);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/all")
    @RequireRole({"ADMIN"})
    public ResponseEntity<List<ActivityLog>> getAllLogs() {
        List<ActivityLog> logs = logService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/range")
    @RequireRole({"ADMIN", "PROFESSOR"})
    public ResponseEntity<List<ActivityLog>> getLogsByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<ActivityLog> logs = logService.getLogsByDateRange(start, end);
        return ResponseEntity.ok(logs);
    }
}
