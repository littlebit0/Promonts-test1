package com.promonts.service;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.submission.AssignmentSubmission;
import com.promonts.domain.todo.Todo;
import com.promonts.domain.user.User;
import com.promonts.dto.AssignmentSubmissionResponse;
import com.promonts.repository.AssignmentRepository;
import com.promonts.repository.AssignmentSubmissionRepository;
import com.promonts.repository.TodoRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {
    
    private final AssignmentSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final TodoRepository todoRepository;
    
    @Value("${file.upload-dir:uploads/submissions}")
    private String uploadDir;
    
    @Transactional
    public AssignmentSubmissionResponse submitAssignment(Long assignmentId, Long userId, String content, MultipartFile file) throws IOException {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 중복 제출 확인
        if (submissionRepository.existsByAssignmentAndUser(assignment, user)) {
            throw new RuntimeException("Already submitted");
        }
        
        // 늦은 제출 여부 확인
        boolean isLate = LocalDateTime.now().isAfter(assignment.getDueDate());
        
        AssignmentSubmission.AssignmentSubmissionBuilder submissionBuilder = AssignmentSubmission.builder()
                .assignment(assignment)
                .user(user)
                .content(content)
                .isLate(isLate);
        
        // 파일 업로드 처리
        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            Path filePath = uploadPath.resolve(fileName);
            file.transferTo(filePath.toFile());
            
            submissionBuilder
                    .fileName(file.getOriginalFilename())
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType());
        }
        
        AssignmentSubmission submission = submissionRepository.save(submissionBuilder.build());
        
        // Todo 자동 완료 처리
        List<Todo> todos = todoRepository.findByUser(user);
        for (Todo todo : todos) {
            if (todo.getTitle() != null && 
                todo.getTitle().equals("[과제] " + assignment.getTitle()) &&
                !todo.getCompleted()) {
                todo.setCompleted(true);
                todoRepository.save(todo);
                break;
            }
        }
        
        return AssignmentSubmissionResponse.from(submission);
    }
    
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return submissionRepository.findByAssignment(assignment).stream()
                .map(AssignmentSubmissionResponse::from)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public AssignmentSubmissionResponse getMySubmission(Long assignmentId, Long userId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return submissionRepository.findByAssignmentAndUser(assignment, user)
                .map(AssignmentSubmissionResponse::from)
                .orElse(null);
    }
    
    @Transactional
    public void gradeSubmission(Long submissionId, Integer score, String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setScore(score);
        submission.setFeedback(feedback);
        submissionRepository.save(submission);
    }
    
    @Transactional
    public void deleteSubmission(Long submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        
        // 파일 삭제
        if (submission.getFilePath() != null) {
            File file = new File(submission.getFilePath());
            if (file.exists()) {
                file.delete();
            }
        }
        
        submissionRepository.delete(submission);
    }
}
