package com.promonts.controller;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.course.Course;
import com.promonts.domain.notice.Notice;
import com.promonts.dto.AssignmentResponse;
import com.promonts.dto.NoticeResponse;
import com.promonts.repository.AssignmentRepository;
import com.promonts.repository.CourseRepository;
import com.promonts.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final NoticeRepository noticeRepository;
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(@RequestParam String query) {
        Map<String, Object> results = new HashMap<>();
        
        // 강의 검색 (이름, 코드)
        List<Course> courses = courseRepository.findAll().stream()
                .filter(c -> c.getName().toLowerCase().contains(query.toLowerCase()) ||
                           c.getCode().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());
        
        // 공지사항 검색 (제목, 내용)
        List<NoticeResponse> notices = noticeRepository.findAll().stream()
                .filter(n -> n.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                           n.getContent().toLowerCase().contains(query.toLowerCase()))
                .map(NoticeResponse::from)
                .collect(Collectors.toList());
        
        // 과제 검색 (제목, 설명)
        List<AssignmentResponse> assignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                           (a.getDescription() != null && a.getDescription().toLowerCase().contains(query.toLowerCase())))
                .map(AssignmentResponse::from)
                .collect(Collectors.toList());
        
        results.put("courses", courses);
        results.put("notices", notices);
        results.put("assignments", assignments);
        results.put("query", query);
        
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/courses")
    public ResponseEntity<List<Course>> searchCourses(@RequestParam String query) {
        List<Course> courses = courseRepository.findAll().stream()
                .filter(c -> c.getName().toLowerCase().contains(query.toLowerCase()) ||
                           c.getCode().toLowerCase().contains(query.toLowerCase()) ||
                           (c.getDescription() != null && c.getDescription().toLowerCase().contains(query.toLowerCase())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }
    
    @GetMapping("/notices")
    public ResponseEntity<List<NoticeResponse>> searchNotices(@RequestParam String query) {
        List<NoticeResponse> notices = noticeRepository.findAll().stream()
                .filter(n -> n.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                           n.getContent().toLowerCase().contains(query.toLowerCase()))
                .map(NoticeResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notices);
    }
    
    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentResponse>> searchAssignments(@RequestParam String query) {
        List<AssignmentResponse> assignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                           (a.getDescription() != null && a.getDescription().toLowerCase().contains(query.toLowerCase())))
                .map(AssignmentResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(assignments);
    }
}
