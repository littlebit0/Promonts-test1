package com.promonts.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class FileSharingService {
    
    private final Map<String, Long> shareLinkMap = new ConcurrentHashMap<>();
    
    public String createShareLink(Long materialId) {
        String token = UUID.randomUUID().toString();
        shareLinkMap.put(token, materialId);
        return token;
    }
    
    public Long getMaterialIdByToken(String token) {
        return shareLinkMap.get(token);
    }
    
    public void revokeShareLink(String token) {
        shareLinkMap.remove(token);
    }
}
