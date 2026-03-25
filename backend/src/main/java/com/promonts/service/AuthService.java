package com.promonts.service;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.repository.UserRepository;
import com.promonts.config.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    @Transactional
    public LoginResponse register(String email, String password, String name, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + email);
        }
        String encodedPassword = passwordEncoder.encode(password);
        User user = User.builder().email(email).password(encodedPassword).name(name).role(role).build();
        User savedUser = userRepository.save(user);
        String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        return LoginResponse.from(savedUser, token);
    }
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다: " + request.getEmail()));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return LoginResponse.from(user, token);
    }
}
