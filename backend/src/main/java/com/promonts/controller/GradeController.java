package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.config.RequireRole;
import com.promonts.domain.grade.Grade;
import com.promonts.service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {
    
    private final GradeService gradeService;
    private final JwtUtil jwtUtil;
    
    @PostMapping
    @RequireRole({"PROFESSOR", "ADMIN"})
    public ResponseEntity<?> createOrUpdate(
            @RequestParam Long userId,
            @RequestParam Long courseId,
            @RequestParam(required = false) Double midterm,
            @RequestParam(required = false) Double finalScore,
            @RequestParam(required = false) Double assignment,
            @RequestParam(required = false) Double attendance) {
        try {
            Grade grade = gradeService.createOrUpdate(userId, courseId, midterm, finalScore, assignment, attendance);
            return ResponseEntity.ok(grade);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<Grade>> getMyGrades(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<Grade> grades = gradeService.getMyGrades(userId);
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/course/{courseId}")
    @RequireRole({"PROFESSOR", "ADMIN"})
    public ResponseEntity<List<Grade>> getCourseGrades(@PathVariable Long courseId) {
        List<Grade> grades = gradeService.getCourseGrades(courseId);
        return ResponseEntity.ok(grades);
    }
    
    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<Grade> getGrade(@PathVariable Long userId, @PathVariable Long courseId) {
        Grade grade = gradeService.getGrade(userId, courseId);
        return ResponseEntity.ok(grade);
    }
}
