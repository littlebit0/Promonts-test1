package com.promonts.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/ms")
@RequiredArgsConstructor
public class MsLinkController {

    @GetMapping("/connect")
    public void startConnect(@RequestParam("token") String token,
            @RequestParam(value = "returnTo", defaultValue = "/security") String returnTo,
            HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.getSession(true).setAttribute("promonts_link_token", token);
        request.getSession(true).setAttribute("promonts_link_return", returnTo);
        log.info("MS 연동 시작 (returnTo: {})", returnTo);
        response.sendRedirect("/oauth2/authorization/microsoft");
    }
}
