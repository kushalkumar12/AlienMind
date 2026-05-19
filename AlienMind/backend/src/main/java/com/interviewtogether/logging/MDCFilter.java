package com.interviewtogether.logging;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class MDCFilter implements Filter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        
        try {
            // Correlation / Request ID Traceability
            String requestId = req.getHeader(REQUEST_ID_HEADER);
            if (requestId == null) requestId = req.getHeader(CORRELATION_ID_HEADER);
            if (requestId == null) requestId = UUID.randomUUID().toString();
            
            MDC.put("requestId", requestId);
            MDC.put("clientIp", getClientIp(req));
            MDC.put("userAgent", req.getHeader("User-Agent"));
            MDC.put("method", req.getMethod());
            MDC.put("uri", req.getRequestURI());
            MDC.put("environment", System.getProperty("spring.profiles.active", "dev"));
            
            // Add Session ID if exists
            if (req.getSession(false) != null) {
                MDC.put("sessionId", req.getSession(false).getId());
            }

            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String remoteAddr = request.getHeader("X-Forwarded-For");
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = request.getRemoteAddr();
        }
        return remoteAddr;
    }

    @Override
    public void init(FilterConfig filterConfig) {}

    @Override
    public void destroy() {}
}
