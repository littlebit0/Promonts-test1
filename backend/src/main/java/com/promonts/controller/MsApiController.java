package com.promonts.controller;

import com.promonts.config.JwtUtil;
import com.promonts.domain.user.User;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ms")
@RequiredArgsConstructor
public class MsApiController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<?> status(@RequestHeader("Authorization") String token) {
        try {
            User user = getUser(token);
            boolean linked = user.getMsEmail() != null && !user.getMsEmail().isBlank();
            return ResponseEntity.ok(Map.of(
                "linked", linked,
                "msEmail", linked ? user.getMsEmail() : "",
                "msName", linked ? (user.getMsName() != null ? user.getMsName() : "") : ""
            ));
        } catch (Exception e) { return ResponseEntity.status(500).body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/link")
    public ResponseEntity<?> link(@RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> body) {
        try {
            User user = getUser(token);
            String msEmail = body.get("msEmail"), msName = body.get("msName"), msToken = body.get("msToken");
            if (msEmail == null || msEmail.isBlank())
                return ResponseEntity.badRequest().body(Map.of("error", "MS 이메일이 없습니다."));
            userRepository.findByMsEmail(msEmail).ifPresent(existing -> {
                if (!existing.getId().equals(user.getId())) {
                    existing.setMsEmail(null); existing.setMsName(null);
                    existing.setMsAccessToken(null); userRepository.save(existing);
                }
            });
            user.setMsEmail(msEmail); user.setMsName(msName);
            if (msToken != null && !msToken.isBlank()) user.setMsAccessToken(msToken);
            userRepository.save(user);
            log.info("MS 연동 완료: {} → {}", user.getEmail(), msEmail);
            return ResponseEntity.ok(Map.of("message", "MS 계정이 연동되었습니다.", "msEmail", msEmail, "msName", msName != null ? msName : ""));
        } catch (Exception e) { return ResponseEntity.status(500).body(Map.of("error", e.getMessage())); }
    }

    @DeleteMapping("/unlink")
    public ResponseEntity<?> unlink(@RequestHeader("Authorization") String token) {
        try {
            User user = getUser(token);
            user.setMsEmail(null); user.setMsName(null); user.setMsAccessToken(null);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "MS 연동이 해제되었습니다."));
        } catch (Exception e) { return ResponseEntity.status(500).body(Map.of("error", e.getMessage())); }
    }

    private User getUser(String authHeader) {
        Long userId = jwtUtil.extractUserId(authHeader.substring(7));
        if (userId == null) throw new RuntimeException("유효하지 않은 토큰입니다.");
        return userRepository.findById(userId).orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}
