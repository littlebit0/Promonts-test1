package com.promonts.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String bio;
    private String phone;
    private String avatar;
}
