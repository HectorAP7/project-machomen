package com.machomen.boletas.repository;

import com.machomen.boletas.model.Boleta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IBoletaRepository extends JpaRepository<Boleta, Integer> {

    /** Boletas de un cliente, ordenadas por fecha descendente */
    List<Boleta> findByUsuarioIdusuarioOrderByFechaDesc(Integer idUsuario);

    /** Todas las boletas, ordenadas por fecha descendente */
    List<Boleta> findAllByOrderByFechaDesc();

    /** Compatibilidad con código anterior */
    List<Boleta> findByUsuarioIdusuario(Integer id);

    /** Conteo de boletas aprobadas para dashboard */
    long countByEstado(Integer estado);

    /** Suma de importe total de boletas aprobadas */
    @Query("SELECT COALESCE(SUM(b.importe_total), 0) FROM Boleta b WHERE b.estado = 2")
    java.math.BigDecimal sumImporteTotalAprobadas();
}
