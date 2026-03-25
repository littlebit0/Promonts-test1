package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;
    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @RequestBody @Valid WorkspaceRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        WorkspaceResponse response = workspaceService.createWorkspace(request, userEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<WorkspaceListResponse>> getWorkspaces(Authentication authentication) {
        String userEmail = authentication.getName();
        List<WorkspaceListResponse> workspaces = workspaceService.getWorkspaces(userEmail);
        return ResponseEntity.ok(workspaces);
    }
    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        WorkspaceResponse workspace = workspaceService.getWorkspace(id, userEmail);
        return ResponseEntity.ok(workspace);
    }
    @PutMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable Long id,
            @RequestBody @Valid WorkspaceRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        WorkspaceResponse response = workspaceService.updateWorkspace(id, request, userEmail);
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{id}/access")
    public ResponseEntity<WorkspaceResponse> accessWorkspace(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        WorkspaceResponse response = workspaceService.accessWorkspace(id, userEmail);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkspace(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        workspaceService.deleteWorkspace(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}
