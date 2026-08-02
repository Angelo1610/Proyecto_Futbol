package ec.edu.espe.master.services;

public interface EmailService {
    void enviarCredencialesAcceso(String toEmail, String firstName, String username, String rawPassword);
}
