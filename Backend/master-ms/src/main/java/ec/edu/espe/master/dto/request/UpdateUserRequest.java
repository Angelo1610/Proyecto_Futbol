package ec.edu.espe.master.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {

    @Size(max = 30, message = "El nombre no puede tener más de 30 caracteres")
    @Pattern(regexp = "^[a-z A-Z]*$", message = "El nombre solo puede contener letras")
    private String firstName;

    @Size(max = 30, message = "El nombre no puede tener más de 30 caracteres")
    @Pattern(regexp = "^[a-z A-Z]*$", message = "El nombre solo puede contener letras")
    private String middleName;

    @Size(max = 30, message = "El apellido no puede tener más de 30 caracteres")
    private String lastName;

    @Pattern(regexp = "^[0-9]*$", message = "El celular solo puede contener numeros")
    @Size(max = 10, message = "El numero de celular debe ser maximo 10 digitos")
    private String phone;

    private String address;

    private String nationality;

    private Boolean active;
}
