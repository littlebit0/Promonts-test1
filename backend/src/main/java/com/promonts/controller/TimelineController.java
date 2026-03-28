package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.log.ActivityLog;
import com.promonts.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timeline")
@RequiredArgsConstructor
public class TimelineController {
    
    private final ActivityLogService activityLogService;
    private final JwtUtil jwtUtil;
    
    @GetMapping
    public ResponseEntity<List<ActivityLog>> getMyTimeline(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<ActivityLog> timeline = activityLogService.getUserLogs(userId);
        return ResponseEntity.ok(timeline);
    }
}
