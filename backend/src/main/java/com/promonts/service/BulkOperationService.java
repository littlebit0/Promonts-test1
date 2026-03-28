package com.promonts.service;

import com.promonts.domain.notice.Notice;
import com.promonts.domain.user.User;
import com.promonts.repository.NoticeRepository;
import com.promonts.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkOperationService {
    
    private final UserRepository userRepository;
    private final NoticeRepository noticeRepository;
    
    @Transactional
    public int deleteMultipleNotices(List<Long> noticeIds) {
        noticeRepository.deleteAllById(noticeIds);
        return noticeIds.size();
    }
    
    @Transactional
    public int bulkUpdateUserRole(List<Long> userIds, User.Role newRole) {
        List<User> users = userRepository.findAllById(userIds);
        users.forEach(user -> user.setRole(newRole));
        userRepository.saveAll(users);
        return users.size();
    }
    
    @Transactional
    public int markNoticesAsRead(List<Long> noticeIds) {
        // 공지사항 읽음 처리 (실제로는 별도 테이블 필요)
        return noticeIds.size();
    }
}
