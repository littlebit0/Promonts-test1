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
@RequestMapping("/api/courses/{courseId}/assignments")
@RequiredArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;
    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable Long courseId,
            @RequestBody @Valid AssignmentRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        AssignmentResponse response = assignmentService.createAssignment(courseId, request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<AssignmentListResponse>> getAssignments(@PathVariable Long courseId) {
        List<AssignmentListResponse> assignments = assignmentService.getAssignmentsByCourse(courseId);
        return ResponseEntity.ok(assignments);
    }
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignment(@PathVariable Long id) {
        AssignmentResponse assignment = assignmentService.getAssignment(id);
        return ResponseEntity.ok(assignment);
    }
    @PutMapping("/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(
            @PathVariable Long id,
            @RequestBody @Valid AssignmentRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        AssignmentResponse response = assignmentService.updateAssignment(id, request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long id,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        assignmentService.deleteAssignment(id, professorEmail);
        return ResponseEntity.noContent().build();
    }
}
