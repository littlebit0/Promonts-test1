package com.promonts.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class FilePreviewService {
    
    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif", "webp", "svg");
    private static final List<String> PDF_EXTENSIONS = Arrays.asList("pdf");
    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList("mp4", "webm", "ogg");
    
    public boolean isPreviewable(String filename) {
        String ext = getExtension(filename).toLowerCase();
        return IMAGE_EXTENSIONS.contains(ext) || PDF_EXTENSIONS.contains(ext) || VIDEO_EXTENSIONS.contains(ext);
    }
    
    public String getPreviewType(String filename) {
        String ext = getExtension(filename).toLowerCase();
        if (IMAGE_EXTENSIONS.contains(ext)) return "image";
        if (PDF_EXTENSIONS.contains(ext)) return "pdf";
        if (VIDEO_EXTENSIONS.contains(ext)) return "video";
        return "none";
    }
    
    private String getExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
}
