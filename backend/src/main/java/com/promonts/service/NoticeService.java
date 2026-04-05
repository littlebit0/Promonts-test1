package com.promonts.service;
import com.promonts.domain.course.Course;
import com.promonts.domain.notice.Notice;
import com.promonts.domain.user.User;
import com.promonts.dto.*;
import com.promonts.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class NoticeService {
    private final NoticeRepository noticeRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    // 글로벌 생성 (courseId 포함)
    @Transactional
    public NoticeResponse createNotice(Long courseId, GlobalNoticeRequest request, String professorEmail) {
        NoticeRequest nr = NoticeRequest.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return createNotice(courseId, nr, professorEmail);
    }
    @Transactional
    public NoticeResponse createNotice(Long courseId, NoticeRequest request, String professorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        User author = userRepository.findByEmail(professorEmail)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다"));
        if (!course.getProfessor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("공지사항을 생성할 권한이 없습니다");
        }
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .course(course)
                .author(author)
                .build();
        Notice savedNotice = noticeRepository.save(notice);
        return NoticeResponse.from(savedNotice);
    }
    @Transactional(readOnly = true)
    public NoticeResponse getNotice(Long noticeId) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항입니다: " + noticeId));
        return NoticeResponse.from(notice);
    }
    @Transactional(readOnly = true)
    public List<NoticeListResponse> getAllNotices() {
        return noticeRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(NoticeListResponse::from)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public List<NoticeListResponse> getNoticesByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 강의입니다: " + courseId));
        return noticeRepository.findByCourseOrderByCreatedAtDesc(course).stream()
                .map(NoticeListResponse::from)
                .collect(Collectors.toList());
    }
    @Transactional
    public NoticeResponse updateNotice(Long noticeId, NoticeRequest request, String professorEmail) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항입니다: " + noticeId));
        if (!notice.getAuthor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("공지사항을 수정할 권한이 없습니다");
        }
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        return NoticeResponse.from(notice);
    }
    @Transactional
    public void deleteNotice(Long noticeId, String professorEmail) {
        Notice notice = noticeRepository.findById(noticeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공지사항입니다: " + noticeId));
        if (!notice.getAuthor().getEmail().equals(professorEmail)) {
            throw new IllegalArgumentException("공지사항을 삭제할 권한이 없습니다");
        }
        noticeRepository.delete(notice);
    }
}
