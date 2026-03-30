package com.promonts.dto;

import com.promonts.domain.submission.AssignmentSubmission;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long userId;
    private String userName;
    private String studentName;
    private String studentEmail;
    private String content;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private LocalDateTime submittedAt;
    private Boolean isLate;
    private Integer score;
    private String feedback;
    
    public static AssignmentSubmissionResponse from(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignment().getId())
                .assignmentTitle(submission.getAssignment().getTitle())
                .userId(submission.getUser().getId())
                .userName(submission.getUser().getName())
                .studentName(submission.getUser().getName())
                .studentEmail(submission.getUser().getEmail())
                .content(submission.getContent())
                .fileName(submission.getFileName())
                .filePath(submission.getFilePath())
                .fileSize(submission.getFileSize())
                .submittedAt(submission.getSubmittedAt())
                .isLate(submission.getIsLate())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .build();
    }
}
