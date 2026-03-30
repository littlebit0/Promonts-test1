package com.promonts.dto;

import com.promonts.domain.chat.ChatMessage;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageResponse {
    private Long id;
    private Long courseId;
    private SenderInfo sender;
    private String content;
    private ChatMessage.MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private LocalDateTime createdAt;

    @Data @AllArgsConstructor
    public static class SenderInfo {
        private Long id;
        private String name;
        private String email;
    }

    public static ChatMessageResponse from(ChatMessage message) {
        SenderInfo senderInfo = new SenderInfo(
            message.getSender().getId(),
            message.getSender().getName(),
            message.getSender().getEmail()
        );
        return ChatMessageResponse.builder()
            .id(message.getId())
            .courseId(message.getCourse().getId())
            .sender(senderInfo)
            .content(message.getContent())
            .type(message.getType())
            .fileUrl(message.getFileUrl())
            .fileName(message.getFileName())
            .fileSize(message.getFileSize())
            .createdAt(message.getCreatedAt())
            .build();
    }
}
