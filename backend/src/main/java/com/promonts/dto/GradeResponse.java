package com.promonts.dto;

import com.promonts.domain.grade.Grade;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeResponse {

    private Long id;
    private Long courseId;
    private String courseName;
    private String courseCode;
    private Double midtermScore;
    private Double finalScore;
    private Double assignmentScore;
    private Double attendanceScore;
    private Double totalScore;
    private String letterGrade;
    private LocalDateTime updatedAt;

    public static GradeResponse from(Grade grade) {
        return GradeResponse.builder()
                .id(grade.getId())
                .courseId(grade.getCourse().getId())
                .courseName(grade.getCourse().getName())
                .courseCode(grade.getCourse().getCode())
                .midtermScore(grade.getMidtermScore())
                .finalScore(grade.getFinalScore())
                .assignmentScore(grade.getAssignmentScore())
                .attendanceScore(grade.getAttendanceScore())
                .totalScore(grade.getTotalScore())
                .letterGrade(grade.getLetterGrade())
                .updatedAt(grade.getUpdatedAt())
                .build();
    }
}
