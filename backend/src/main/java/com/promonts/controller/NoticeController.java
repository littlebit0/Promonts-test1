package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.NoticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/courses/{courseId}/notices")
@RequiredArgsConstructor
public class NoticeController {
    private final NoticeService noticeService;
    @PostMapping
    public ResponseEntity<NoticeResponse> createNotice(
            @PathVariable Long courseId,
            @RequestBody @Valid NoticeRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        NoticeResponse response = noticeService.createNotice(courseId, request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @GetMapping
    public ResponseEntity<List<NoticeListResponse>> getNotices(@PathVariable Long courseId) {
        List<NoticeListResponse> notices = noticeService.getNoticesByCourse(courseId);
        return ResponseEntity.ok(notices);
    }
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNotice(@PathVariable Long id) {
        NoticeResponse notice = noticeService.getNotice(id);
        return ResponseEntity.ok(notice);
    }
    @PutMapping("/{id}")
    public ResponseEntity<NoticeResponse> updateNotice(
            @PathVariable Long id,
            @RequestBody @Valid NoticeRequest request,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        NoticeResponse response = noticeService.updateNotice(id, request, professorEmail);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long id,
            Authentication authentication) {
        String professorEmail = authentication.getName();
        noticeService.deleteNotice(id, professorEmail);
        return ResponseEntity.noContent().build();
    }
}
