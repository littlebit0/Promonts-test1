package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.enrollment.CourseEnrollment;
import com.promonts.dto.EnrollmentRequest;
import com.promonts.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    
    private final EnrollmentService enrollmentService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    public ResponseEntity<?> enroll(
            @RequestBody EnrollmentRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            CourseEnrollment enrollment = enrollmentService.enroll(userId, request.getCourseId());
            return ResponseEntity.ok(Map.of("message", "Enrolled successfully", "enrollmentId", enrollment.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{courseId}")
    public ResponseEntity<?> unenroll(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            enrollmentService.unenroll(userId, courseId);
            return ResponseEntity.ok(Map.of("message", "Unenrolled successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollments(@PathVariable Long courseId) {
        List<CourseEnrollment> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }
    
    @GetMapping("/course/{courseId}/check")
    public ResponseEntity<Map<String, Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        
        boolean enrolled = enrollmentService.isEnrolled(userId, courseId);
        return ResponseEntity.ok(Map.of("enrolled", enrolled));
    }
}
