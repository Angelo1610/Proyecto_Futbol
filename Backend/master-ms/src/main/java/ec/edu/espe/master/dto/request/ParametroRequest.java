package ec.edu.espe.master.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ParametroRequest {
    @NotBlank
    private String clave;

    @NotBlank
    private String valor;

    private String descripcion;
}
