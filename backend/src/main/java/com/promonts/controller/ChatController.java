package com.promonts.controller;

import com.promonts.dto.*;
import com.promonts.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @RestController
    @RequestMapping("/api/chat")
    @RequiredArgsConstructor
    public static class ChatRestController {
        private final ChatService chatService;
        private final SimpMessagingTemplate messagingTemplate;

        private static final String UPLOAD_DIR = "uploads/chat/";
        private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

        @PostMapping("/messages")
        public ResponseEntity<ChatMessageResponse> sendMessage(
                @RequestBody @Valid ChatMessageRequest request,
                Authentication authentication) {
            String senderEmail = authentication.getName();
            ChatMessageResponse response = chatService.sendMessage(request, senderEmail);

            messagingTemplate.convertAndSend(
                "/topic/course/" + request.getCourseId(),
                response
            );

            return ResponseEntity.ok(response);
        }

        @GetMapping("/courses/{courseId}/messages")
        public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long courseId) {
            List<ChatMessageResponse> messages = chatService.getMessages(courseId);
            return ResponseEntity.ok(messages);
        }

        @PostMapping("/upload")
        public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
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
                String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
                String storedName = UUID.randomUUID() + ext;

                Path filePath = uploadPath.resolve(storedName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                String fileUrl = "/uploads/chat/" + storedName;
                return ResponseEntity.ok(Map.of(
                    "fileUrl", fileUrl,
                    "fileName", originalFilename != null ? originalFilename : storedName,
                    "fileSize", file.getSize()
                ));
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(Map.of("error", "파일 업로드에 실패했습니다: " + e.getMessage()));
            }
        }
    }
}
