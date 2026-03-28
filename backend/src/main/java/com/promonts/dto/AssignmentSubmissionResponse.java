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
    private String content;
    private String fileName;
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
                .content(submission.getContent())
                .fileName(submission.getFileName())
                .fileSize(submission.getFileSize())
                .submittedAt(submission.getSubmittedAt())
                .isLate(submission.getIsLate())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .build();
    }
}
