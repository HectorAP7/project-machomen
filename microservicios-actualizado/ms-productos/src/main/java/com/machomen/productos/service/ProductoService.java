package com.machomen.productos.service;

import com.machomen.productos.dto.CategoriaDTO;
import com.machomen.productos.model.Categoria;
import com.machomen.productos.model.Distrito;
import com.machomen.productos.model.Producto;
import com.machomen.productos.repository.ICategoriaRepository;
import com.machomen.productos.repository.IDistritoRepository;
import com.machomen.productos.repository.IProductoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class ProductoService {

    private static final Logger log = LoggerFactory.getLogger(ProductoService.class);

    @Autowired private IProductoRepository  repoProd;
    @Autowired private ICategoriaRepository repoCat;
    @Autowired private IDistritoRepository  repoDistrito;

    // ── PRODUCTOS ──────────────────────────────────────────────────────────────

    public List<Producto> filtrar(String nombre, Integer idcategoria) {
        return repoProd.filtrar(nombre == null ? "" : nombre, idcategoria == null ? 0 : idcategoria);
    }

    public Producto obtenerPorId(Integer id) {
        return repoProd.findById(id).orElse(null);
    }

    @Transactional
    public Producto guardar(Producto p) {
        return repoProd.save(p);
    }

    @Transactional
    public void cambiarEstado(int id, int estado) {
        Producto p = repoProd.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        p.setEstado(estado);
        repoProd.save(p);
        log.info("Producto #{} estado -> {}", id, estado);
    }

    @Transactional
    public void cambiarEstadoBody(Integer id, boolean activo) {
        cambiarEstado(id, activo ? 1 : 0);
    }

    @Transactional
    public void eliminar(Integer id) {
        repoProd.deleteById(id);
        log.info("Producto #{} eliminado", id);
    }

    public boolean existe(Integer id) {
        return repoProd.existsById(id);
    }

    // ── CATEGORÍAS ─────────────────────────────────────────────────────────────

    public List<CategoriaDTO> listarCategoriasParaCatalogo() {
        return repoCat.obtenerCategoriasConConteo();
    }

    public List<Categoria> listarCategoriasAdmin() {
        return repoCat.findAll();
    }

    public Optional<Categoria> obtenerCategoriaPorId(int id) {
        return repoCat.findById(id);
    }

    @Transactional
    public Categoria guardarCategoria(Categoria c) {
        return repoCat.save(c);
    }

    @Transactional
    public void cambiarEstadoCategoria(int id, int estado) {
        Categoria c = repoCat.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));
        c.setEstado(estado);
        repoCat.save(c);
    }

    // ── DISTRITOS ─────────────────────────────────────────────────────────────

    public List<Distrito> listarDistritos() {
        return repoDistrito.findAll();
    }
}
