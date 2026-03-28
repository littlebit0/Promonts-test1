package com.promonts.service;

import com.promonts.domain.assignment.Assignment;
import com.promonts.domain.exam.Exam;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CalendarService {
    
    private static final DateTimeFormatter ICAL_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
    
    public String generateICalendar(List<Assignment> assignments, List<Exam> exams) {
        StringBuilder ical = new StringBuilder();
        ical.append("BEGIN:VCALENDAR\n");
        ical.append("VERSION:2.0\n");
        ical.append("PRODID:-//Promonts//Calendar//EN\n");
        
        for (Assignment assignment : assignments) {
            ical.append("BEGIN:VEVENT\n");
            ical.append("SUMMARY:").append(assignment.getTitle()).append("\n");
            ical.append("DTSTART:").append(assignment.getDueDate().format(ICAL_FORMAT)).append("\n");
            ical.append("DESCRIPTION:").append(assignment.getDescription() != null ? assignment.getDescription() : "").append("\n");
            ical.append("END:VEVENT\n");
        }
        
        for (Exam exam : exams) {
            ical.append("BEGIN:VEVENT\n");
            ical.append("SUMMARY:").append(exam.getTitle()).append("\n");
            ical.append("DTSTART:").append(exam.getExamDate().format(ICAL_FORMAT)).append("\n");
            ical.append("DURATION:PT").append(exam.getDurationMinutes()).append("M\n");
            ical.append("LOCATION:").append(exam.getLocation() != null ? exam.getLocation() : "").append("\n");
            ical.append("END:VEVENT\n");
        }
        
        ical.append("END:VCALENDAR\n");
        return ical.toString();
    }
}
