package com.promonts.repository;
import com.promonts.domain.workspace.Workspace;
import com.promonts.domain.user.User;
import com.promonts.domain.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, Long> {
    List<Workspace> findByUser(User user);
    List<Workspace> findByUserAndCourse(User user, Course course);
    List<Workspace> findByUserOrderByLastAccessedAtDesc(User user);
}
