package com.promonts.controller;

import com.promonts.domain.exam.Exam;
import com.promonts.service.ExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {
    
    private final ExamService examService;
    
    @PostMapping("/course/{courseId}")
    public ResponseEntity<?> createExam(@PathVariable Long courseId, @RequestBody Exam exam) {
        try {
            Exam created = examService.createExam(courseId, exam);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{examId}")
    public ResponseEntity<?> updateExam(@PathVariable Long examId, @RequestBody Exam exam) {
        try {
            Exam updated = examService.updateExam(examId, exam);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{examId}")
    public ResponseEntity<?> deleteExam(@PathVariable Long examId) {
        try {
            examService.deleteExam(examId);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Exam>> getExams(@PathVariable Long courseId) {
        List<Exam> exams = examService.getExamsByCourse(courseId);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/course/{courseId}/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams(@PathVariable Long courseId) {
        List<Exam> exams = examService.getUpcomingExams(courseId);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/{examId}")
    public ResponseEntity<Exam> getExam(@PathVariable Long examId) {
        Exam exam = examService.getExamById(examId);
        return ResponseEntity.ok(exam);
    }
}
