package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.dto.AssignmentSubmissionResponse;
import com.promonts.service.AssignmentSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;
    private final JwtUtil jwtUtil;

    @Value("${file.submission-dir:uploads/submissions}")
    private String uploadDir;

    @PostMapping("/{assignmentId}")
    public ResponseEntity<?> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile file) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            AssignmentSubmissionResponse response = submissionService.submitAssignment(assignmentId, userId, content, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<AssignmentSubmissionResponse>> getSubmissions(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    @GetMapping("/assignment/{assignmentId}/my")
    public ResponseEntity<?> getMySubmission(
            @PathVariable Long assignmentId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            AssignmentSubmissionResponse submission = submissionService.getMySubmission(assignmentId, userId);
            if (submission == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(submission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{submissionId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Long submissionId) {
        try {
            AssignmentSubmissionResponse sub = submissionService.getSubmissionById(submissionId);
            if (sub == null || sub.getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            Path filePath = Paths.get(sub.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists()) return ResponseEntity.notFound().build();

            String filename = sub.getFileName() != null ? sub.getFileName() : filePath.getFileName().toString();
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{submissionId}/grade")
    public ResponseEntity<?> gradeSubmission(
            @PathVariable Long submissionId,
            @RequestParam Integer score,
            @RequestParam(required = false) String feedback) {
        try {
            submissionService.gradeSubmission(submissionId, score, feedback);
            return ResponseEntity.ok(Map.of("message", "채점 완료"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{submissionId}")
    public ResponseEntity<?> deleteSubmission(
            @PathVariable Long submissionId,
            @RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            submissionService.deleteSubmission(submissionId);
            return ResponseEntity.ok(Map.of("message", "제출 취소 완료"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
