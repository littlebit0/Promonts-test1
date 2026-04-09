package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.user.User;
import com.promonts.repository.UserRepository;
import com.promonts.service.MailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
public class MailController {

    private final MailService mailService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.ok(Map.of("connected", false, "email", ""));
            }
            String jwt = token.substring(7);
            if (!jwtUtil.validateToken(jwt)) {
                return ResponseEntity.ok(Map.of("connected", false, "email", ""));
            }
            Long userId = jwtUtil.extractUserId(jwt);
            if (userId == null) return ResponseEntity.ok(Map.of("connected", false, "email", ""));
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) return ResponseEntity.ok(Map.of("connected", false, "email", ""));
            boolean hasToken = user.getMsEmail() != null && !user.getMsEmail().isBlank()
                    && user.getMsAccessToken() != null && !user.getMsAccessToken().isBlank();
            return ResponseEntity.ok(Map.of("connected", hasToken, "email", hasToken ? user.getMsEmail() : ""));
        } catch (Exception e) {
            log.error("mail/status 오류", e);
            return ResponseEntity.ok(Map.of("connected", false, "email", ""));
        }
    }

    @GetMapping("/inbox")
    public ResponseEntity<?> inbox(@RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "20") int top,
            @RequestParam(required = false) String skipToken) {
        try {
            User user = getUser(token);
            requireMsToken(user);
            List<Map<String, Object>> messages = mailService.getInbox(user, top, skipToken);
            return ResponseEntity.ok(Map.of("messages", messages));
        } catch (Exception e) { return handleError(e); }
    }

    @GetMapping("/sent")
    public ResponseEntity<?> sent(@RequestHeader("Authorization") String token,
            @RequestParam(defaultValue = "20") int top) {
        try {
            User user = getUser(token);
            requireMsToken(user);
            List<Map<String, Object>> messages = mailService.getSentItems(user, top);
            return ResponseEntity.ok(Map.of("messages", messages));
        } catch (Exception e) { return handleError(e); }
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<?> getMessage(@RequestHeader("Authorization") String token,
            @PathVariable String messageId) {
        try {
            User user = getUser(token);
            requireMsToken(user);
            mailService.markAsRead(user, messageId);
            return ResponseEntity.ok(mailService.getMessage(user, messageId));
        } catch (Exception e) { return handleError(e); }
    }

    @PostMapping("/send")
    public ResponseEntity<?> send(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        try {
            User user = getUser(token);
            requireMsToken(user);
            String to = body.get("to"), subject = body.get("subject"), content = body.get("body");
            boolean isHtml = "html".equalsIgnoreCase(body.getOrDefault("contentType", "text"));
            if (to == null || subject == null || content == null)
                return ResponseEntity.badRequest().body(Map.of("error", "to, subject, body는 필수입니다."));
            mailService.sendMail(user, to, subject, content, isHtml);
            return ResponseEntity.ok(Map.of("message", "메일이 발송되었습니다."));
        } catch (Exception e) { return handleError(e); }
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> delete(@RequestHeader("Authorization") String token,
            @PathVariable String messageId) {
        try {
            User user = getUser(token);
            requireMsToken(user);
            mailService.deleteMessage(user, messageId);
            return ResponseEntity.ok(Map.of("message", "삭제되었습니다."));
        } catch (Exception e) { return handleError(e); }
    }

    private User getUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) throw new RuntimeException("유효하지 않은 토큰입니다.");
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        if (userId == null) throw new RuntimeException("토큰에서 사용자 ID를 추출할 수 없습니다.");
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private void requireMsToken(User user) {
        if (user.getMsAccessToken() == null || user.getMsAccessToken().isBlank())
            throw new RuntimeException("Microsoft 계정이 연결되지 않았습니다. 먼저 Microsoft로 로그인해주세요.");
    }

    private ResponseEntity<?> handleError(Exception e) {
        log.error("메일 API 오류", e);
        String msg = e.getMessage();
        if (msg != null && (msg.contains("Microsoft 계정이 연결되지") || msg.contains("토큰이 만료")))
            return ResponseEntity.status(403).body(Map.of("error", msg, "requireMsLogin", true));
        return ResponseEntity.status(500).body(Map.of("error", "메일 처리 중 오류가 발생했습니다: " + msg));
    }
}
