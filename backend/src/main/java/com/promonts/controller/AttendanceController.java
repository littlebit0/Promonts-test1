package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.attendance.Attendance;
import com.promonts.domain.attendance.AttendanceSession;
import com.promonts.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/session")
    public ResponseEntity<?> createSession(
            @RequestParam Long courseId,
            @RequestParam(defaultValue = "10") int durationMinutes) {
        try {
            AttendanceSession session = attendanceService.createSession(courseId, durationMinutes);
            return ResponseEntity.ok(Map.of(
                    "sessionId", session.getId(),
                    "qrCode", session.getQrCode(),
                    "expiresAt", session.getExpiresAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/check")
    public ResponseEntity<?> checkAttendance(
            @RequestParam String qrCode,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            Attendance attendance = attendanceService.checkAttendance(qrCode, userId);
            return ResponseEntity.ok(Map.of(
                    "message", "Attendance checked",
                    "attendanceId", attendance.getId(),
                    "status", attendance.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Attendance>> getCourseAttendances(@PathVariable Long courseId) {
        List<Attendance> attendances = attendanceService.getAttendancesByCourse(courseId);
        return ResponseEntity.ok(attendances);
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<Attendance>> getMyAttendances(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        
        List<Attendance> attendances = attendanceService.getMyAttendances(userId);
        return ResponseEntity.ok(attendances);
    }
    
    @GetMapping("/session/{courseId}")
    public ResponseEntity<?> getActiveSession(@PathVariable Long courseId) {
        AttendanceSession session = attendanceService.getActiveSession(courseId);
        if (session == null) {
            return ResponseEntity.ok(Map.of("active", false));
        }
        return ResponseEntity.ok(Map.of(
                "active", true,
                "sessionId", session.getId(),
                "qrCode", session.getQrCode(),
                "expiresAt", session.getExpiresAt()
        ));
    }
}
