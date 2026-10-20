package com.machomen.productos.repository;

import com.machomen.productos.model.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ICuponRepository extends JpaRepository<Cupon, Integer> {
    Optional<Cupon> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
}
