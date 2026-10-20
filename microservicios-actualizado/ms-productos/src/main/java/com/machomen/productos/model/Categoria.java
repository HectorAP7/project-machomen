package com.machomen.productos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tb_categoria")
public class Categoria {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idcategoria;
    private String descripcion;
    private Integer estado;

    @OneToMany(mappedBy = "categoria")
    @JsonIgnore
    private List<Producto> productos;

    public Integer getIdcategoria() { return idcategoria; }
    public void setIdcategoria(Integer v) { this.idcategoria = v; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String v) { this.descripcion = v; }
    public Integer getEstado() { return estado; }
    public void setEstado(Integer v) { this.estado = v; }
    public List<Producto> getProductos() { return productos; }
    public void setProductos(List<Producto> v) { this.productos = v; }
}
