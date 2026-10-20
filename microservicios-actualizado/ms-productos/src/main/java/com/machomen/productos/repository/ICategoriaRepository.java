package com.machomen.productos.repository;

import com.machomen.productos.dto.CategoriaDTO;
import com.machomen.productos.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ICategoriaRepository extends JpaRepository<Categoria, Integer> {

    @Query("SELECT new com.machomen.productos.dto.CategoriaDTO(c.idcategoria, c.descripcion, COUNT(p)) " +
           "FROM Categoria c LEFT JOIN c.productos p " +
           "GROUP BY c.idcategoria, c.descripcion")
    List<CategoriaDTO> obtenerCategoriasConConteo();
}
