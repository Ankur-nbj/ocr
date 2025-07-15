package com.example.ocr.controller;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
@CrossOrigin(origins = "http://localhost:3000")
public class OcrController {

    @PostMapping("/extract")
    public ResponseEntity<Map<String, String>> extractDetails(@RequestParam("file") MultipartFile file) {
        Map<String, String> extracted = new HashMap<>();

        try {
            File tempFile = File.createTempFile("upload", file.getOriginalFilename());
            file.transferTo(tempFile);

            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath("tessdata"); // Make sure tessdata folder is placed in your working dir

            String text = tesseract.doOCR(tempFile);

            extracted = parseText(text);
            tempFile.delete();
        } catch (IOException | TesseractException e) {
            e.printStackTrace();
        }
    
        return ResponseEntity.ok(extracted);
    }

    private Map<String, String> parseText(String text) {
        Map<String, String> data = new HashMap<>();

        // Very simple pattern matchers for demo purposes
        data.put("name", match(text, "(?i)(Name|NAME)[ :]*([A-Z ]+)", 2));
        data.put("fatherName", match(text, "(?i)(Father's Name|S/O)[ :]*([A-Z ]+)", 2));
        data.put("gender", match(text, "(?i)(Male|Female|Transgender)", 1));
        data.put("dob", match(text, "(?i)(DOB|Date of Birth)[ :]*([0-9]{2}/[0-9]{2}/[0-9]{4})", 2));
        data.put("address", match(text, "(?i)(Address)[ :]*(.*)", 2));

        return data;
    }

    private String match(String text, String pattern, int group) {
        java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = p.matcher(text);
        if (m.find()) {
            return m.group(group);
        }
        return "";
    }
}
