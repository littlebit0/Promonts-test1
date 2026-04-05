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
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class GlobalNoticeController {
    private final NoticeService noticeService;

    // 전체 공지 조회 (GET /api/notices)
    @GetMapping
    public ResponseEntity<List<NoticeListResponse>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    // 특정 공지 조회 (GET /api/notices/{id})
    @GetMapping("/{id}")
    public ResponseEntity<NoticeResponse> getNotice(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getNotice(id));
    }

    // 공지 생성 (POST /api/notices) - courseId는 body에
    @PostMapping
    public ResponseEntity<NoticeResponse> createNotice(
            @RequestBody @Valid GlobalNoticeRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(noticeService.createNotice(request.getCourseId(), request, email));
    }

    // 공지 수정 (PUT /api/notices/{id})
    @PutMapping("/{id}")
    public ResponseEntity<NoticeResponse> updateNotice(
            @PathVariable Long id,
            @RequestBody @Valid NoticeRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(noticeService.updateNotice(id, request, authentication.getName()));
    }

    // 공지 삭제 (DELETE /api/notices/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long id,
            Authentication authentication) {
        noticeService.deleteNotice(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
