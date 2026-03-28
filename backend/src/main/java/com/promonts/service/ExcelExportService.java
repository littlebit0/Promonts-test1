package com.promonts.service;

import com.promonts.domain.grade.Grade;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class ExcelExportService {
    
    public byte[] exportGradesToExcel(List<Grade> grades) {
        // TODO: Apache POI 사용하여 실제 엑셀 생성
        log.info("Exporting {} grades to Excel", grades.size());
        
        // CSV 형식으로 임시 구현
        StringBuilder csv = new StringBuilder();
        csv.append("Student,Course,Midterm,Final,Assignment,Attendance,Total,Grade\n");
        
        for (Grade grade : grades) {
            csv.append(grade.getUser().getName()).append(",");
            csv.append(grade.getCourse().getName()).append(",");
            csv.append(grade.getMidtermScore()).append(",");
            csv.append(grade.getFinalScore()).append(",");
            csv.append(grade.getAssignmentScore()).append(",");
            csv.append(grade.getAttendanceScore()).append(",");
            csv.append(grade.getTotalScore()).append(",");
            csv.append(grade.getLetterGrade()).append("\n");
        }
        
        return csv.toString().getBytes();
    }
}
