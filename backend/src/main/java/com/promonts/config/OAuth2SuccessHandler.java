package com.promonts.config;

import com.promonts.domain.user.User;
import com.promonts.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final OAuth2AuthorizedClientService authorizedClientService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                         HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String msEmail = oAuth2User.getAttribute("email");
            String msName  = oAuth2User.getAttribute("name");
            if (msEmail == null) msEmail = oAuth2User.getAttribute("preferred_username");
            if (msName == null || msName.isBlank()) msName = msEmail;
            log.info("OAuth2 로그인 성공: {}", msEmail);

            String msAccessToken = null;
            String msRefreshToken = null;
            LocalDateTime msTokenExpiresAt = null;
            try {
                if (authentication instanceof OAuth2AuthenticationToken oauthToken) {
                    OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                            oauthToken.getAuthorizedClientRegistrationId(), oauthToken.getName());
                    if (client != null && client.getAccessToken() != null) {
                        msAccessToken = client.getAccessToken().getTokenValue();
                        if (client.getAccessToken().getExpiresAt() != null) {
                            msTokenExpiresAt = LocalDateTime.ofInstant(
                                client.getAccessToken().getExpiresAt(), java.time.ZoneId.systemDefault());
                        }
                        log.info("MS 액세스 토큰 획득 (길이: {})", msAccessToken.length());
                    }
                    if (client != null && client.getRefreshToken() != null) {
                        msRefreshToken = client.getRefreshToken().getTokenValue();
                        log.info("MS 리프레시 토큰 획득 성공");
                    }
                }
            } catch (Exception e) {
                log.warn("MS 토큰 추출 실패: {}", e.getMessage());
            }

            String frontendUrl = System.getenv("FRONTEND_URL");
            if (frontendUrl == null || frontendUrl.isBlank()) frontendUrl = "http://localhost:5173";

            HttpSession session = request.getSession(false);
            String linkToken = (session != null) ? (String) session.getAttribute("promonts_link_token") : null;

            if (linkToken != null) {
                String returnTo = (String) session.getAttribute("promonts_link_return");
                if (returnTo == null) returnTo = "/security";
                session.removeAttribute("promonts_link_token");
                session.removeAttribute("promonts_link_return");
                try {
                    Long userId = jwtUtil.extractUserId(linkToken);
                    User user = userRepository.findById(userId).orElse(null);
                    if (user != null) {
                        final String finalMsEmail = msEmail;
                        userRepository.findByMsEmail(msEmail).ifPresent(existing -> {
                            if (!existing.getId().equals(user.getId())) {
                                existing.setMsEmail(null); existing.setMsName(null);
                                existing.setMsAccessToken(null); userRepository.save(existing);
                            }
                        });
                        user.setMsEmail(msEmail); user.setMsName(msName);
                        if (msAccessToken != null) { user.setMsAccessToken(msAccessToken); user.setMsTokenExpiresAt(msTokenExpiresAt); }
                        if (msRefreshToken != null) user.setMsRefreshToken(msRefreshToken);
                        userRepository.save(user);
                        log.info("로그인 상태에서 MS 연동 완료: {} → {}", user.getEmail(), msEmail);
                        response.sendRedirect(frontendUrl + returnTo + "?ms=linked");
                        return;
                    }
                } catch (Exception e) { log.warn("연동 토큰 처리 실패: {}", e.getMessage()); }
            }

            Optional<User> existingUser = userRepository.findByMsEmail(msEmail);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (msAccessToken != null) { user.setMsAccessToken(msAccessToken); user.setMsTokenExpiresAt(msTokenExpiresAt); }
                if (msRefreshToken != null) user.setMsRefreshToken(msRefreshToken);
                user.setMsName(msName);
                userRepository.save(user);
                String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
                String redirectUrl = frontendUrl + "/oauth2/callback"
                        + "?token=" + URLEncoder.encode(jwt, StandardCharsets.UTF_8)
                        + "&name=" + URLEncoder.encode(user.getName(), StandardCharsets.UTF_8)
                        + "&email=" + URLEncoder.encode(user.getEmail(), StandardCharsets.UTF_8)
                        + "&role=" + user.getRole().name();
                log.info("기존 연동 계정 로그인: {}", user.getEmail());
                response.sendRedirect(redirectUrl);
            } else {
                log.info("미연동 MS 계정, 연동 페이지로 이동: {}", msEmail);
                String tokenParam = msAccessToken != null ? URLEncoder.encode(msAccessToken, StandardCharsets.UTF_8) : "";
                String redirectUrl = frontendUrl + "/oauth2/link"
                        + "?msEmail=" + URLEncoder.encode(msEmail, StandardCharsets.UTF_8)
                        + "&msName=" + URLEncoder.encode(msName, StandardCharsets.UTF_8)
                        + "&msToken=" + tokenParam;
                response.sendRedirect(redirectUrl);
            }
        } catch (Exception e) {
            log.error("OAuth2 성공 핸들러 오류", e);
            String frontendUrl = System.getenv("FRONTEND_URL");
            if (frontendUrl == null) frontendUrl = "http://localhost:5173";
            response.sendRedirect(frontendUrl + "/login?error=oauth2");
        }
    }
}
