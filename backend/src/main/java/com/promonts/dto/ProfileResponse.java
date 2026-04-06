package com.promonts.dto;

import com.promonts.domain.user.User;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String studentId;
    private String department;
    private String phone;
    private String avatarUrl;

    public static ProfileResponse from(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .studentId(user.getStudentId())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
