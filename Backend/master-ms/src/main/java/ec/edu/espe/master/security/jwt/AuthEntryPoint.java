package ec.edu.espe.master.security.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                          AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String message = authException.getMessage() == null ? "" : authException.getMessage().replace("\"", "'");
        String body = "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"" + message
                + "\",\"path\":\"" + request.getRequestURI() + "\"}";
        response.getWriter().write(body);
    }
}
