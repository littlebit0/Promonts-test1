package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;
    @PostMapping
    public ResponseEntity<CourseResponse> createCourse(@RequestBody @Valid CourseRequest request,Authentication authentication) {
        String professorEmail = authentication.getName();
        CourseResponse response = courseService.createCourse(request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<CourseListResponse>> getCourses() {
        List<CourseListResponse> courses = courseService.getCourses();
        return ResponseEntity.ok(courses);
    }
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        CourseResponse course = courseService.getCourse(id);
        return ResponseEntity.ok(course);
    }
    @GetMapping("/my")
    public ResponseEntity<List<CourseListResponse>> getMyCourses(Authentication authentication) {
        String professorEmail = authentication.getName();
        List<CourseListResponse> courses = courseService.getCoursesByProfessor(professorEmail);
        return ResponseEntity.ok(courses);
    }
    @PutMapping("/{id}")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id,@RequestBody @Valid CourseRequest request,Authentication authentication) {
        String professorEmail = authentication.getName();
        CourseResponse response = courseService.updateCourse(id, request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id,Authentication authentication) {
        String professorEmail = authentication.getName();
        courseService.deleteCourse(id, professorEmail);
        return ResponseEntity.noContent().build();
    }
}
