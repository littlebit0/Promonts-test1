package com.promonts.service;
import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.course.Course;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    @Transactional
    public AssignmentResponse createAssignment(Long courseId, AssignmentRequest request, String professorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        if (!course.getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("과제를 생성할 권한이 없습니다");
        }
        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .course(course)
                .build();
        Assignment savedAssignment = assignmentRepository.save(assignment);
        return AssignmentResponse.from(savedAssignment);
    }
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다: " + assignmentId));
        return AssignmentResponse.from(assignment);
    }
    @Transactional(readOnly = true)
    public List<AssignmentListResponse> getAssignmentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        return assignmentRepository.findByCourse(course).stream()
                .map(AssignmentListResponse::from)
                .collect(Collectors.toList());
    }
    @Transactional
    public AssignmentResponse updateAssignment(Long assignmentId, AssignmentRequest request, String professorEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다: " + assignmentId));
        if (!assignment.getCourse().getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("과제를 수정할 권한이 없습니다");
        }
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        return AssignmentResponse.from(assignment);
    }
    @Transactional
    public void deleteAssignment(Long assignmentId, String professorEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다: " + assignmentId));
        if (!assignment.getCourse().getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("과제를 삭제할 권한이 없습니다");
        }
        assignmentRepository.delete(assignment);
    }
}
