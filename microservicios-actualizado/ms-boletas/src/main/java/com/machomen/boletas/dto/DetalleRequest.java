package com.machomen.boletas.dto;
import java.math.BigDecimal;

public class DetalleRequest {
    private Integer    idProducto;
    private Integer    cantidad;
    private BigDecimal precio;
    private String     talla;   // ← NUEVO: talla seleccionada por el cliente

    public Integer    getIdProducto() { return idProducto; }
    public void       setIdProducto(Integer v)  { this.idProducto = v; }
    public Integer    getCantidad()   { return cantidad; }
    public void       setCantidad(Integer v)    { this.cantidad = v; }
    public BigDecimal getPrecio()     { return precio; }
    public void       setPrecio(BigDecimal v)   { this.precio = v; }
    public String     getTalla()      { return talla; }
    public void       setTalla(String v)        { this.talla = v; }
}
