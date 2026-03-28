package com.promonts.repository;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.submission.AssignmentSubmission;
import com.promonts.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    List<AssignmentSubmission> findByAssignment(Assignment assignment);
    Optional<AssignmentSubmission> findByAssignmentAndUser(Assignment assignment, User user);
    List<AssignmentSubmission> findByUser(User user);
    boolean existsByAssignmentAndUser(Assignment assignment, User user);
}
