package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.dto.*;
import com.promonts.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024; // 20MB
    private static final String UPLOAD_DIR = "uploads/chat/";

    @PostMapping("/messages")
    public ResponseEntity<?> sendMessage(
            @RequestBody ChatMessageRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
            }

            // content null 방어
            if (request.getContent() == null || request.getContent().isBlank()) {
                if (request.getFileName() != null) {
                    request.setContent(request.getFileName());
                } else {
                    request.setContent("파일");
                }
            }

            String jwt = authHeader.substring(7);
            String senderEmail = jwtUtil.getEmailFromToken(jwt);

            ChatMessageResponse response = chatService.sendMessage(request, senderEmail);

            messagingTemplate.convertAndSend(
                "/topic/course/" + request.getCourseId(),
                response
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/courses/{courseId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long courseId) {
        List<ChatMessageResponse> messages = chatService.getMessages(courseId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "인증이 필요합니다."));
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일이 비어 있습니다."));
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("error", "파일 크기는 20MB 이하여야 합니다."));
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String ext = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String storedName = UUID.randomUUID() + ext;
            Files.copy(file.getInputStream(), uploadPath.resolve(storedName), StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of(
                "fileUrl", "/uploads/chat/" + storedName,
                "fileName", originalFilename != null ? originalFilename : storedName,
                "fileSize", file.getSize()
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "파일 업로드 실패: " + e.getMessage()));
        }
    }
}
