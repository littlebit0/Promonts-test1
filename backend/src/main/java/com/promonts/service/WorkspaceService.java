package com.promonts.service;
import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import com.promonts.domain.workspace.Workspace;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다"));
        }
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .user(user)
                .course(course)
                .notes(request.getNotes())
                .lastAccessedAt(LocalDateTime.now())
                .build();
        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return WorkspaceResponse.from(savedWorkspace);
    }
    @Transactional(readOnly = true)
    public WorkspaceResponse getWorkspace(Long workspaceId, String userEmail) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 워크스페이스입니다: " + workspaceId));
        if (!workspace.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("조회할 권한이 없습니다");
        }
        return WorkspaceResponse.from(workspace);
    }
    @Transactional(readOnly = true)
    public List<WorkspaceListResponse> getWorkspaces(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        return workspaceRepository.findByUserOrderByLastAccessedAtDesc(user).stream()
                .map(WorkspaceListResponse::from)
                .collect(Collectors.toList());
    }
    @Transactional
    public WorkspaceResponse updateWorkspace(Long workspaceId, WorkspaceRequest request, String userEmail) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 워크스페이스입니다: " + workspaceId));
        if (!workspace.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("수정할 권한이 없습니다");
        }
        Course course = null;
        if (request.getCourseId() != null) {
            course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다"));
        }
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setCourse(course);
        workspace.setNotes(request.getNotes());
        return WorkspaceResponse.from(workspace);
    }
    @Transactional
    public WorkspaceResponse accessWorkspace(Long workspaceId, String userEmail) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 워크스페이스입니다: " + workspaceId));
        if (!workspace.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("접근할 권한이 없습니다");
        }
        workspace.setLastAccessedAt(LocalDateTime.now());
        return WorkspaceResponse.from(workspace);
    }
    @Transactional
    public void deleteWorkspace(Long workspaceId, String userEmail) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 워크스페이스입니다: " + workspaceId));
        if (!workspace.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("삭제할 권한이 없습니다");
        }
        workspaceRepository.delete(workspace);
    }
}
