package com.machomen.productos.repository;

import com.machomen.productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface IProductoRepository extends JpaRepository<Producto, Integer> {

    @Query("SELECT p FROM Producto p WHERE " +
           "(:nombre IS NULL OR :nombre = '' OR LOWER(p.descripcion) LIKE LOWER(CONCAT('%',:nombre,'%'))) AND " +
           "(:idcategoria = 0 OR p.categoria.idcategoria = :idcategoria)")
    List<Producto> filtrar(@Param("nombre") String nombre, @Param("idcategoria") Integer idcategoria);
}
