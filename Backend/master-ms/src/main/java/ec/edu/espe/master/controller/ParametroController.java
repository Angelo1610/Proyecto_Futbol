package ec.edu.espe.master.controller;

import ec.edu.espe.master.dto.request.ParametroRequest;
import ec.edu.espe.master.dto.response.ParametroResponse;
import ec.edu.espe.master.entity.Parametro;
import ec.edu.espe.master.repository.ParametroRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/parametros")
@RequiredArgsConstructor
public class ParametroController {

    private final ParametroRepository parametroRepository;

    @GetMapping
    public ResponseEntity<List<ParametroResponse>> getAll() {
        return ResponseEntity.ok(parametroRepository.findAll().stream().map(this::toResponse).toList());
    }

    @GetMapping("/{clave}")
    public ResponseEntity<ParametroResponse> getByClave(@PathVariable String clave) {
        Parametro parametro = parametroRepository.findByClave(clave)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parámetro no encontrado"));
        return ResponseEntity.ok(toResponse(parametro));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ParametroResponse> create(@Valid @RequestBody ParametroRequest request) {
        Parametro parametro = Parametro.builder()
                .clave(request.getClave())
                .valor(request.getValor())
                .descripcion(request.getDescripcion())
                .active(true)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(parametroRepository.save(parametro)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<ParametroResponse> update(@PathVariable UUID id, @Valid @RequestBody ParametroRequest request) {
        Parametro parametro = parametroRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parámetro no encontrado"));
        parametro.setClave(request.getClave());
        parametro.setValor(request.getValor());
        parametro.setDescripcion(request.getDescripcion());
        return ResponseEntity.ok(toResponse(parametroRepository.save(parametro)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        parametroRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ParametroResponse toResponse(Parametro parametro) {
        return ParametroResponse.builder()
                .id(parametro.getId())
                .clave(parametro.getClave())
                .valor(parametro.getValor())
                .descripcion(parametro.getDescripcion())
                .active(parametro.getActive())
                .build();
    }
}
