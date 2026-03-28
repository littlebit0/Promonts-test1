package com.promonts.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    public void sendEmail(String to, String subject, String body) {
        // TODO: 실제 이메일 전송 구현 (JavaMailSender 사용)
        log.info("Email would be sent to: {} | Subject: {}", to, subject);
    }
    
    public void sendAssignmentNotification(String to, String courseName, String assignmentTitle) {
        String subject = "[Promonts] 새로운 과제: " + assignmentTitle;
        String body = String.format("강의 '%s'에 새로운 과제 '%s'가 등록되었습니다.", courseName, assignmentTitle);
        sendEmail(to, subject, body);
    }
    
    public void sendGradeNotification(String to, String courseName, String grade) {
        String subject = "[Promonts] 성적 공지";
        String body = String.format("'%s' 강의의 성적이 공개되었습니다: %s", courseName, grade);
        sendEmail(to, subject, body);
    }
}
