package com.promonts.service;
import com.promonts.domain.chat.ChatMessage;
import com.promonts.domain.course.Course;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    @Transactional
    public ChatMessageResponse sendMessage(ChatMessageRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + request.getCourseId()));
        ChatMessage.MessageType type = request.getType() != null ? request.getType() : ChatMessage.MessageType.TEXT;
        ChatMessage message = ChatMessage.builder()
                .course(course)
                .sender(sender)
                .content(request.getContent())
                .type(type)
                .build();
        ChatMessage savedMessage = chatMessageRepository.save(message);
        return ChatMessageResponse.from(savedMessage);
    }
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getMessages(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        return chatMessageRepository.findTop50ByCourseOrderByCreatedAtDesc(course).stream()
                .map(ChatMessageResponse::from)
                .collect(Collectors.toList());
    }
}
