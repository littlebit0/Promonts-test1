package com.promonts.service;

import org.springframework.stereotype.Service;

// 31. API 속도 제한
@Service
public class RateLimitService {
    public boolean checkLimit(String userId) {
        return true;
    }
}
