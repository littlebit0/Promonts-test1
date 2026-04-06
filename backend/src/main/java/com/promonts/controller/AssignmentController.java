package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;

    // 강의별 과제 CRUD
    // 전체 과제 목록 조회 (GET /api/assignments)
    @GetMapping("/api/assignments")
    public ResponseEntity<List<AssignmentListResponse>> getAllAssignments(Authentication authentication) {
        return ResponseEntity.ok(assignmentService.getAllAssignments(authentication.getName()));
    }

    @PostMapping("/api/courses/{courseId}/assignments")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable Long courseId,
            @RequestBody @Valid AssignmentRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        AssignmentResponse response = assignmentService.createAssignment(courseId, request, professorEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentListResponse>> getAssignments(@PathVariable Long courseId) {
        List<AssignmentListResponse> assignments = assignmentService.getAssignmentsByCourse(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/api/courses/{courseId}/assignments/{id}")
    public ResponseEntity<AssignmentResponse> getAssignment(@PathVariable Long courseId, @PathVariable Long id) {
        AssignmentResponse assignment = assignmentService.getAssignment(id);
        return ResponseEntity.ok(assignment);
    }

    @PutMapping("/api/courses/{courseId}/assignments/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long courseId,
            @PathVariable Long id,
            @RequestBody @Valid AssignmentRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        AssignmentResponse response = assignmentService.updateAssignment(id, request, professorEmail);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/api/courses/{courseId}/assignments/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long courseId,
            @PathVariable Long id,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        assignmentService.deleteAssignment(id, professorEmail);
        return ResponseEntity.noContent().build();
    }

    // 독립 엔드포인트 - Dashboard 등에서 courseId 없이 조회할 때 사용
    @GetMapping("/api/assignments/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        AssignmentResponse assignment = assignmentService.getAssignment(id);
        return ResponseEntity.ok(assignment);
    }
}
