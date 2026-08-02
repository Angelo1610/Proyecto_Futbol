package ec.edu.espe.master.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ParametroResponse {
    private UUID id;
    private String clave;
    private String valor;
    private String descripcion;
    private Boolean active;
}
