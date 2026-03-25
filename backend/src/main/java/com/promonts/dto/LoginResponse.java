package com.promonts.dto;
import com.promonts.domain.user.User;
import lombok.*;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
    private String token;
    private String email;
    private String name;
    private User.Role role;
    public static LoginResponse from(User user, String token) {
        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
