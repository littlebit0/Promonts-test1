package com.promonts.service;
import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor
public class CourseService {
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final WeekService weekService;
    @Transactional
    public CourseResponse createCourse(CourseRequest request, String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        if (professor.getRole() != User.Role.PROFESSOR) {
            throw new IllegalArgumentException("강의는 교수만 생성할 수 있습니다");
        }
        if (courseRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 강의 코드입니다: " + request.getCode());
        }
        Course course = Course.builder().name(request.getName()).code(request.getCode()).professor(professor)
                .semester(request.getSemester()).year(request.getYear()).description(request.getDescription()).build();
        Course savedCourse = courseRepository.save(course);
        
        // 1~15주차 자동 생성
        weekService.initializeWeeksForCourse(savedCourse.getId());
        
        return CourseResponse.from(savedCourse);
    }
    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        return CourseResponse.from(course);
    }
    @Transactional(readOnly = true)
    public List<CourseListResponse> getCourses() {
        return courseRepository.findAll().stream().map(CourseListResponse::from).collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<CourseListResponse> getCoursesByProfessor(String professorEmail) {
        User professor = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        return courseRepository.findByProfessor(professor).stream().map(CourseListResponse::from).collect(Collectors.toList());
    }
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request, String professorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        if (!course.getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("강의를 수정할 권한이 없습니다");
        }
        course.setName(request.getName());
        course.setSemester(request.getSemester());
        course.setYear(request.getYear());
        course.setDescription(request.getDescription());
        return CourseResponse.from(course);
    }
    @Transactional
    public void deleteCourse(Long courseId, String professorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        if (!course.getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("강의를 삭제할 권한이 없습니다");
        }
        courseRepository.delete(course);
    }
}
