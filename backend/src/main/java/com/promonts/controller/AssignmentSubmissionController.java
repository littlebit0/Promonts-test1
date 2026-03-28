package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.dto.AssignmentSubmissionResponse;
import com.promonts.service.AssignmentSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class AssignmentSubmissionController {
    
    private final AssignmentSubmissionService submissionService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/{assignmentId}")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile file) {
        try {
            String jwt = token.substring(7);
            String email = jwtUtil.extractEmail(jwt);
            Long userId = jwtUtil.extractUserId(jwt);
            
            AssignmentSubmissionResponse response = submissionService.submitAssignment(assignmentId, userId, content, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissions(@PathVariable Long assignmentId) {
        List<AssignmentSubmissionResponse> submissions = submissionService.getSubmissionsByAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }
    
    @GetMapping("/assignment/{assignmentId}/my")
    public ResponseEntity<AssignmentSubmissionResponse> getMySubmission(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token) {
        String jwt = token.substring(7);
        Long userId = jwtUtil.extractUserId(jwt);
        
        AssignmentSubmissionResponse submission = submissionService.getMySubmission(assignmentId, userId);
        return ResponseEntity.ok(submission);
    }
    
    @PatchMapping("/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestParam Integer score,
            @RequestParam(required = false) String feedback) {
        try {
            submissionService.gradeSubmission(submissionId, score, feedback);
            return ResponseEntity.ok(Map.of("message", "Graded successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{submissionId}")
    public ResponseEntity<?> deleteSubmission(@PathVariable Long submissionId) {
        try {
            submissionService.deleteSubmission(submissionId);
            return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
