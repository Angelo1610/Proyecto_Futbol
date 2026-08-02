package ec.edu.espe.master.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {

    @NotBlank(message = "El DNI es obligatorio")
    @Size(max = 10, message = "El dni no puede tener mas de 10 caracteres")
    @Pattern(regexp = "^[0-9]+$", message = "el Dni solo puede contene rnumeros")
    private String dni;

    @NotBlank
    @Size(max = 30, message = "El nombre no puede tener más de 30 caracteres")
    @Pattern(regexp = "^[a-z A-Z]+$", message = "El nombre solo puede contener letras")
    private String firstName;

    @Size(max = 30, message = "El nombre no puede tener más de 30 caracteres")
    @Pattern(regexp = "^[a-z A-Z]*$", message = "El nombre solo puede contener letras")
    private String middleName;

    @NotBlank
    @Size(max = 30, message = "El apellido no puede tener más de 30 caracteres")
    private String lastName;

    @NotBlank
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "El correo electrónico no es válido")
    @Size(max = 50, message = "El correo electrónico no puede tener más de 50 caracteres")
    private String email;

    @NotBlank
    @Pattern(regexp = "^[0-9]+$", message = "El celular solo puede contener numeros" )
    @Size(max = 10, message = "El numero de celular debe ser maximo 10 digitos")
    private String phone;

    @NotBlank(message = "El campo de direccion es obligatorio")
    private String address;

    @NotBlank(message = "El nacionalidad de direccion es obligatorio")
    private String nationality;

    @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

}