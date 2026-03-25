package com.promonts.controller;
import com.promonts.dto.*;
import com.promonts.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;
@Controller
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public ChatMessageResponse sendMessage(
            @Valid ChatMessageRequest request,
            SimpMessageHeaderAccessor headerAccessor) {
        String senderEmail = (String) headerAccessor.getSessionAttributes().get("userEmail");
        return chatService.sendMessage(request, senderEmail);
    }
    @RestController
    @RequestMapping("/api/chat")
    @RequiredArgsConstructor
    public static class ChatRestController {
        private final ChatService chatService;
        @PostMapping("/messages")
        public ResponseEntity<ChatMessageResponse> sendMessage(
                @RequestBody @Valid ChatMessageRequest request,
                Authentication authentication) {
            String senderEmail = authentication.getName();
            ChatMessageResponse response = chatService.sendMessage(request, senderEmail);
            return ResponseEntity.ok(response);
        }
        @GetMapping("/courses/{courseId}/messages")
        public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long courseId) {
            List<ChatMessageResponse> messages = chatService.getMessages(courseId);
            return ResponseEntity.ok(messages);
        }
    }
}
