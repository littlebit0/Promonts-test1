package com.promonts.controller;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody @Valid RegisterRequest request) {
        LoginResponse response = authService.register(request.getEmail(),request.getPassword(),request.getName(),request.getRole());
        return ResponseEntity.ok(response);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    public static class RegisterRequest {
        private String email;
        private String password;
        private String name;
        private User.Role role = User.Role.STUDENT;
        public String getEmail() { return email; }
        public String getPassword() { return password; }
        public String getName() { return name; }
        public User.Role getRole() { return role; }
        public void setEmail(String email) { this.email = email; }
        public void setPassword(String password) { this.password = password; }
        public void setName(String name) { this.name = name; }
        public void setRole(User.Role role) { this.role = role; }
    }
}
