package com.promonts.controller;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.material.CourseMaterial;
import com.promonts.domain.user.User;
import com.promonts.domain.week.Week;
import com.promonts.dto.*;
import com.promonts.repository.AssignmentRepository;
import com.promonts.service.CourseMaterialService;
import com.promonts.service.WeekService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseId}/weeks")
@RequiredArgsConstructor
@Tag(name = "Week", description = "주차 관리 API")
public class WeekController {
    private final WeekService weekService;
    private final CourseMaterialService materialService;
    private final AssignmentRepository assignmentRepository;

    @GetMapping
    @Operation(summary = "강의 주차 목록 조회")
    public ResponseEntity<List<WeekResponse>> getWeeks(@PathVariable Long courseId) {
        List<Week> weeks = weekService.getWeeksByCourse(courseId);
        List<WeekResponse> response = weeks.stream()
                .map(w -> WeekResponse.builder()
                        .id(w.getId())
                        .courseId(w.getCourse().getId())
                        .weekNumber(w.getWeekNumber())
                        .description(w.getDescription())
                        .createdAt(w.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{weekNumber}")
    @Operation(summary = "특정 주차 상세 조회")
    public ResponseEntity<WeekDetailResponse> getWeekDetail(
            @PathVariable Long courseId,
            @PathVariable Integer weekNumber) {
        Week week = weekService.getWeek(courseId, weekNumber);

        // 주차 정보
        WeekResponse weekResponse = WeekResponse.builder()
                .id(week.getId())
                .courseId(week.getCourse().getId())
                .weekNumber(week.getWeekNumber())
                .description(week.getDescription())
                .createdAt(week.getCreatedAt())
                .build();

        // 강의 자료
        List<CourseMaterial> materials = materialService.getMaterialsByWeek(week.getId());
        List<CourseMaterialResponse> materialResponses = materials.stream()
                .map(m -> CourseMaterialResponse.builder()
                        .id(m.getId())
                        .weekId(m.getWeek().getId())
                        .title(m.getTitle())
                        .description(m.getDescription())
                        .fileName(m.getFileName())
                        .fileSize(m.getFileSize())
                        .contentType(m.getContentType())
                        .uploadedAt(m.getUploadedAt())
                        .uploadedByName(m.getUploadedBy().getName())
                        .build())
                .collect(Collectors.toList());

        // 과제
        List<Assignment> assignments = assignmentRepository.findByWeekId(week.getId());
        List<AssignmentResponse> assignmentResponses = assignments.stream()
                .map(AssignmentResponse::from)
                .collect(Collectors.toList());

        WeekDetailResponse response = WeekDetailResponse.builder()
                .week(weekResponse)
                .materials(materialResponses)
                .assignments(assignmentResponses)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{weekNumber}/materials")
    @Operation(summary = "강의 자료 업로드")
    public ResponseEntity<CourseMaterialResponse> uploadMaterial(
            @PathVariable Long courseId,
            @PathVariable Integer weekNumber,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {

        Week week = weekService.getWeek(courseId, weekNumber);
        CourseMaterial material = materialService.uploadMaterial(
                week.getId(), title, description, file, user);

        CourseMaterialResponse response = CourseMaterialResponse.builder()
                .id(material.getId())
                .weekId(material.getWeek().getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .fileName(material.getFileName())
                .fileSize(material.getFileSize())
                .contentType(material.getContentType())
                .uploadedAt(material.getUploadedAt())
                .uploadedByName(material.getUploadedBy().getName())
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/materials/{materialId}")
    @Operation(summary = "강의 자료 삭제")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long materialId) {
        materialService.deleteMaterial(materialId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{weekId}/description")
    @Operation(summary = "주차 설명 수정")
    public ResponseEntity<WeekResponse> updateWeekDescription(
            @PathVariable Long weekId,
            @RequestBody String description) {
        Week week = weekService.updateWeekDescription(weekId, description);
        WeekResponse response = WeekResponse.builder()
                .id(week.getId())
                .courseId(week.getCourse().getId())
                .weekNumber(week.getWeekNumber())
                .description(week.getDescription())
                .createdAt(week.getCreatedAt())
                .build();
        return ResponseEntity.ok(response);
    }
}
