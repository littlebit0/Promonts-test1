package com.promonts.config;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.course.Course;
import com.promonts.domain.enrollment.CourseEnrollment;
import com.promonts.domain.material.CourseMaterial;
import com.promonts.domain.notice.Notice;
import com.promonts.domain.todo.Todo;
import com.promonts.domain.user.User;
import com.promonts.domain.week.Week;
import com.promonts.repository.*;
import com.promonts.service.WeekService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final NoticeRepository noticeRepository;
    private final AssignmentRepository assignmentRepository;
    private final CourseMaterialRepository materialRepository;
    private final WeekRepository weekRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final TodoRepository todoRepository;
    private final WeekService weekService;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 관리자 계정 (ADMIN 역할)
        User admin = null;
        if (!userRepository.findByEmail("admin@promonts.com").isPresent()) {
            admin = User.builder()
                    .email("admin@promonts.com")
                    .password(passwordEncoder.encode("admin123"))
                    .name("관리자")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("✅ 관리자 계정 생성: admin@promonts.com / admin123");
        } else {
            admin = userRepository.findByEmail("admin@promonts.com").get();
        }

        // 교수 계정
        User professor = null;
        if (!userRepository.findByEmail("professor@promonts.com").isPresent()) {
            professor = User.builder()
                    .email("professor@promonts.com")
                    .password(passwordEncoder.encode("prof123"))
                    .name("김교수")
                    .role(User.Role.PROFESSOR)
                    .build();
            userRepository.save(professor);
            log.info("✅ 교수 계정 생성: professor@promonts.com / prof123");
        } else {
            professor = userRepository.findByEmail("professor@promonts.com").get();
        }

        // 학생 계정
        User student = null;
        if (!userRepository.findByEmail("student@promonts.com").isPresent()) {
            student = User.builder()
                    .email("student@promonts.com")
                    .password(passwordEncoder.encode("student123"))
                    .name("이학생")
                    .role(User.Role.STUDENT)
                    .build();
            userRepository.save(student);
            log.info("✅ 학생 계정 생성: student@promonts.com / student123");
        } else {
            student = userRepository.findByEmail("student@promonts.com").get();
        }

        // 테스트 강의 생성
        if (courseRepository.findByCode("CS101").isEmpty()) {
            Course testCourse = Course.builder()
                    .name("자료구조")
                    .code("CS101")
                    .professor(professor)
                    .semester("1학기")
                    .year(2024)
                    .description("자료구조의 기본 개념과 알고리즘을 학습합니다.")
                    .build();
            courseRepository.save(testCourse);
            log.info("✅ 테스트 강의 생성: 자료구조 (CS101)");

            // 학생 수강 등록
            CourseEnrollment enrollment = CourseEnrollment.builder()
                    .course(testCourse)
                    .user(student)
                    .build();
            enrollmentRepository.save(enrollment);
            log.info("✅ 학생 수강 등록: 이학생 → 자료구조");

            // 주차 생성 (1~15주차)
            weekService.initializeWeeksForCourse(testCourse.getId());
            log.info("✅ 1~15주차 생성 완료");

            // 1주차 가져오기
            Week week1 = weekRepository.findByCourseIdAndWeekNumber(testCourse.getId(), 1)
                    .orElseThrow();

            // 테스트 공지사항
            Notice testNotice = Notice.builder()
                    .title("강의 오리엔테이션 안내")
                    .content("안녕하세요. 자료구조 강의를 수강하시는 학생 여러분,\n\n" +
                            "첫 주차는 강의 소개 및 자료구조의 기본 개념에 대해 다룰 예정입니다.\n" +
                            "수업 시간에 뵙겠습니다.\n\n감사합니다.")
                    .course(testCourse)
                    .author(professor)
                    .build();
            noticeRepository.save(testNotice);
            log.info("✅ 테스트 공지사항 생성");

            // 테스트 과제 (1주차)
            Assignment testAssignment = Assignment.builder()
                    .title("1주차 과제: 배열과 리스트")
                    .description("배열과 연결 리스트의 차이점에 대해 설명하고, " +
                            "각각의 장단점을 비교 분석하세요. (A4 1페이지 이상)")
                    .dueDate(LocalDateTime.now().plusDays(7))
                    .course(testCourse)
                    .week(week1)
                    .build();
            assignmentRepository.save(testAssignment);
            log.info("✅ 테스트 과제 생성 (1주차)");
            
            // 학생 할 일 자동 생성
            Todo studentTodo = Todo.builder()
                    .title("[과제] " + testAssignment.getTitle())
                    .description(testAssignment.getDescription())
                    .dueDate(testAssignment.getDueDate())
                    .user(student)
                    .completed(false)
                    .relatedCourse(testCourse.getName())
                    .build();
            todoRepository.save(studentTodo);
            log.info("✅ 학생 할 일 자동 생성: [과제] 1주차 과제");

            // 테스트 강의 자료 (PDF)
            // 실제 파일은 생성하지 않고 메타데이터만 저장
            String uploadDir = "uploads/materials";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String testFileName = "test_lecture_material.pdf";
            String testFilePath = uploadDir + "/" + testFileName;
            
            // 더미 PDF 파일 생성 (실제로는 빈 파일)
            File testFile = new File(testFilePath);
            if (!testFile.exists()) {
                try (FileOutputStream fos = new FileOutputStream(testFile)) {
                    String pdfContent = "%PDF-1.4\n%테스트 강의 자료\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
                            "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
                            "3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> " +
                            "/MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n" +
                            "4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(1주차 강의 자료) Tj\nET\nendstream\nendobj\n" +
                            "xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n" +
                            "0000000317 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n409\n%%EOF";
                    fos.write(pdfContent.getBytes());
                }
                log.info("✅ 더미 PDF 파일 생성: {}", testFilePath);
            }

            CourseMaterial testMaterial = CourseMaterial.builder()
                    .week(week1)
                    .title("1주차 강의 자료 - 자료구조 개론")
                    .description("자료구조의 기본 개념과 분류에 대한 강의 자료입니다.")
                    .fileName(testFileName)
                    .filePath(testFilePath)
                    .fileSize(testFile.length())
                    .contentType("application/pdf")
                    .uploadedBy(professor)
                    .build();
            materialRepository.save(testMaterial);
            log.info("✅ 테스트 강의 자료 생성 (1주차, PDF)");
        }

        log.info("========================================");
        log.info("🎓 Promonts 테스트 계정");
        log.info("========================================");
        log.info("👤 관리자: admin@promonts.com / admin123");
        log.info("👨‍🏫 교수: professor@promonts.com / prof123");
        log.info("👨‍🎓 학생: student@promonts.com / student123");
        log.info("========================================");
        log.info("📚 테스트 강의: 자료구조 (CS101)");
        log.info("📢 공지사항: 1개");
        log.info("📝 과제: 1개 (1주차)");
        log.info("📄 강의 자료: 1개 (1주차, PDF)");
        log.info("========================================");
    }
}
