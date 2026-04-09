package com.promonts.service;

import com.promonts.domain.user.User;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${spring.security.oauth2.client.registration.microsoft.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.microsoft.client-secret}")
    private String clientSecret;

    @Value("${azure.tenant-id:common}")
    private String tenantId;

    private static final String GRAPH_BASE = "https://graph.microsoft.com/v1.0/me";

    // ─── Token Management ────────────────────────────────────────────────────

    private String getValidToken(User user) {
        java.time.LocalDateTime expiresAt = user.getMsTokenExpiresAt();
        boolean expired = expiresAt == null || expiresAt.isBefore(java.time.LocalDateTime.now().plusMinutes(5));
        if (expired) {
            try {
                refreshToken(user);
            } catch (Exception e) {
                log.warn("토큰 갱신 실패, 기존 토큰 사용: {}", e.getMessage());
            }
        }
        String token = user.getMsAccessToken();
        if (token == null || token.isBlank()) throw new RuntimeException("Microsoft 액세스 토큰이 없습니다. 다시 로그인해주세요.");
        return token;
    }

    private void refreshToken(User user) {
        if (user.getMsRefreshToken() == null || user.getMsRefreshToken().isBlank()) {
            log.warn("리프레시 토큰 없음, 갱신 불가");
            return;
        }
        String url = "https://login.microsoftonline.com/" + tenantId + "/oauth2/v2.0/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "refresh_token");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("refresh_token", user.getMsRefreshToken());
        params.add("scope", "https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send offline_access");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, new HttpEntity<>(params, headers), Map.class);
            Map<?, ?> body = response.getBody();
            if (body != null && body.containsKey("access_token")) {
                user.setMsAccessToken((String) body.get("access_token"));
                if (body.containsKey("refresh_token")) user.setMsRefreshToken((String) body.get("refresh_token"));
                Object expiresIn = body.get("expires_in");
                if (expiresIn != null) {
                    long seconds = Long.parseLong(expiresIn.toString());
                    user.setMsTokenExpiresAt(java.time.LocalDateTime.now().plusSeconds(seconds));
                }
                userRepository.save(user);
                log.info("MS 토큰 갱신 완료: {}", user.getMsEmail());
            }
        } catch (Exception e) {
            log.error("MS 토큰 갱신 실패", e);
            throw new RuntimeException("토큰이 만료되었습니다. 다시 Microsoft로 로그인해주세요.");
        }
    }

    // ─── Mail Operations ─────────────────────────────────────────────────────

    public List<Map<String, Object>> getInbox(User user, int top, String skipToken) {
        String url = GRAPH_BASE + "/mailFolders/inbox/messages?$top=" + top
                + "&$select=id,subject,from,receivedDateTime,isRead,bodyPreview"
                + "&$orderby=receivedDateTime desc";
        if (skipToken != null && !skipToken.isBlank()) url += "&$skiptoken=" + skipToken;
        return fetchMessagesWithRetry(user, url);
    }

    public List<Map<String, Object>> getSentItems(User user, int top) {
        String url = GRAPH_BASE + "/mailFolders/sentItems/messages?$top=" + top
                + "&$select=id,subject,toRecipients,sentDateTime,bodyPreview"
                + "&$orderby=sentDateTime desc";
        return fetchMessagesWithRetry(user, url);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchMessagesWithRetry(User user, String url) {
        String token = getValidToken(user);
        try {
            return doFetchMessages(token, url);
        } catch (HttpClientErrorException.Unauthorized e) {
            log.warn("401 수신, 토큰 갱신 후 재시도");
            refreshToken(user);
            return doFetchMessages(user.getMsAccessToken(), url);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> doFetchMessages(String token, String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        Map<?, ?> body = response.getBody();
        if (body == null) return Collections.emptyList();
        Object value = body.get("value");
        if (value instanceof List<?>) return (List<Map<String, Object>>) value;
        return Collections.emptyList();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getMessage(User user, String messageId) {
        String token = getValidToken(user);
        String url = GRAPH_BASE + "/messages/" + messageId + "?$select=id,subject,from,toRecipients,receivedDateTime,isRead,body";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        return response.getBody() != null ? response.getBody() : Collections.emptyMap();
    }

    public void sendMail(User user, String to, String subject, String content, boolean isHtml) {
        String token = getValidToken(user);
        String url = GRAPH_BASE + "/sendMail";

        Map<String, Object> message = new HashMap<>();
        message.put("subject", subject);
        message.put("body", Map.of("contentType", isHtml ? "HTML" : "Text", "content", content));
        message.put("toRecipients", List.of(Map.of("emailAddress", Map.of("address", to))));

        Map<String, Object> payload = Map.of("message", message, "saveToSentItems", true);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), Void.class);
        log.info("메일 발송 완료: {} → {}", user.getMsEmail(), to);
    }

    public void markAsRead(User user, String messageId) {
        String token = getValidToken(user);
        String url = GRAPH_BASE + "/messages/" + messageId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.exchange(url, HttpMethod.PATCH, new HttpEntity<>(Map.of("isRead", true), headers), Void.class);
        } catch (Exception e) {
            log.warn("읽음 처리 실패 (messageId: {}): {}", messageId, e.getMessage());
        }
    }

    public void deleteMessage(User user, String messageId) {
        String token = getValidToken(user);
        String url = GRAPH_BASE + "/messages/" + messageId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
        log.info("메일 삭제 완료: {}", messageId);
    }
}
