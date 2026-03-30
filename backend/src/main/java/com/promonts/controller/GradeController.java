package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.config.RequireRole;
import com.promonts.domain.grade.Grade;
import com.promonts.dto.GradeResponse;
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
            return ResponseEntity.ok(GradeResponse.from(grade));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<List<GradeResponse>> getMyGrades(@RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        List<Grade> grades = gradeService.getMyGrades(userId);
        List<GradeResponse> response = grades.stream().map(GradeResponse::from).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/course/{courseId}")
    @RequireRole({"PROFESSOR", "ADMIN"})
    public ResponseEntity<List<GradeResponse>> getCourseGrades(@PathVariable Long courseId) {
        List<Grade> grades = gradeService.getCourseGrades(courseId);
        List<GradeResponse> response = grades.stream().map(GradeResponse::from).toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/course/{courseId}")
    public ResponseEntity<GradeResponse> getGrade(@PathVariable Long userId, @PathVariable Long courseId) {
        Grade grade = gradeService.getGrade(userId, courseId);
        if (grade == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(GradeResponse.from(grade));
    }
}
