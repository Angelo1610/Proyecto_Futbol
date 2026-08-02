package ec.edu.espe.master.services.impl;

import ec.edu.espe.master.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Override
    public void enviarCredencialesAcceso(String toEmail, String firstName, String username, String rawPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(toEmail);
        message.setSubject("TickGo - Tus credenciales de acceso");
        message.setText(
                "Hola " + firstName + ",\n\n" +
                        "Tu cuenta en TickGo fue creada exitosamente. Estas son tus credenciales de primer acceso:\n\n" +
                        "Usuario: " + username + "\n" +
                        "Contraseña temporal: " + rawPassword + "\n\n" +
                        "Por seguridad, cambia tu contraseña apenas ingreses al sistema.\n\n" +
                        "Equipo TickGo"
        );

        try {
            mailSender.send(message);
            log.info("Correo de credenciales enviado a {}", toEmail);
        } catch (Exception e) {
            // No se bloquea el registro si el correo falla: la cuenta ya quedó creada.
            log.error("No se pudo enviar el correo de credenciales a {}: {}", toEmail, e.getMessage());
        }
    }
}
