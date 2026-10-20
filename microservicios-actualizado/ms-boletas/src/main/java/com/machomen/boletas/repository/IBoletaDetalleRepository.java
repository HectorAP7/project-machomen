package com.machomen.boletas.repository;

import com.machomen.boletas.model.BoletaDetalle;
import com.machomen.boletas.model.BoletaDetallePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IBoletaDetalleRepository extends JpaRepository<BoletaDetalle, BoletaDetallePK> {

    @Query("SELECT d FROM BoletaDetalle d LEFT JOIN FETCH d.producto WHERE d.idboleta = :idboleta")
    List<BoletaDetalle> findByIdboleta(@Param("idboleta") Integer idboleta);

    /**
     * Top productos más vendidos: suma de cantidades por producto,
     * contando SOLO boletas aprobadas (estado = 2).
     * Devuelve filas [idproducto, descripcion, totalVendido] ordenadas desc.
     */
    @Query("""
            SELECT d.idproducto, p.descripcion, SUM(d.cantidad)
            FROM BoletaDetalle d
            JOIN d.producto p
            JOIN d.boleta b
            WHERE b.estado = 2
            GROUP BY d.idproducto, p.descripcion
            ORDER BY SUM(d.cantidad) DESC
            """)
    List<Object[]> topProductosVendidos();
}
