package com.machomen.productos.dto;

public class CategoriaDTO {
    private Integer idcategoria;
    private String descripcion;
    private Long cantidadProductos;

    public CategoriaDTO(Integer idcategoria, String descripcion, Long cantidadProductos) {
        this.idcategoria = idcategoria;
        this.descripcion = descripcion;
        this.cantidadProductos = cantidadProductos;
    }

    public Integer getIdcategoria() { return idcategoria; }
    public String getDescripcion() { return descripcion; }
    public Long getCantidadProductos() { return cantidadProductos; }
}
