package ec.edu.espe.master.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El username es obligatorio")
    @Size(max = 50, message = "El usuario no puede tener mas de 50 caracteres")
    private String username;

    @NotBlank
    private String password;

    //agregarvalidaciones
}