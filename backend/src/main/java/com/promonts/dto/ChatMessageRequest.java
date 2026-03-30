package com.promonts.dto;

import com.promonts.domain.chat.ChatMessage;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageRequest {
    private Long courseId;
    private String content;
    private ChatMessage.MessageType type;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
}
