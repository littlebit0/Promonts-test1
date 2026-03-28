package com.promonts.config;

import com.promonts.domain.user.User;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;

@Aspect
@Component
@RequiredArgsConstructor
public class RoleCheckAspect {
    
    private final JwtUtil jwtUtil;
    
    @Before("@annotation(requireRole)")
    public void checkRole(RequireRole requireRole) {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String token = request.getHeader("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized");
        }
        
        String jwt = token.substring(7);
        String role = jwtUtil.getRoleFromToken(jwt);
        
        boolean hasRole = Arrays.asList(requireRole.value()).contains(role);
        if (!hasRole) {
            throw new RuntimeException("Forbidden: Requires role " + Arrays.toString(requireRole.value()));
        }
    }
}
