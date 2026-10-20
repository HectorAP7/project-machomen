package com.machomen.boletas.dto;

import java.math.BigDecimal;
import java.util.List;

public class BoletaRequest {
    private Integer    idUsuario;
    private Integer    idDistrito;
    private String     direccion;
    private Integer    tipoPago;
    private String     nroOperacion;
    private BigDecimal subtotal;
    private BigDecimal envio;    private BigDecimal total;
    private List<DetalleRequest> items;

    public Integer    getIdUsuario()    { return idUsuario; }
    public void       setIdUsuario(Integer v)    { this.idUsuario = v; }
    public Integer    getIdDistrito()   { return idDistrito; }
    public void       setIdDistrito(Integer v)   { this.idDistrito = v; }
    public String     getDireccion()    { return direccion; }
    public void       setDireccion(String v)     { this.direccion = v; }
    public Integer    getTipoPago()     { return tipoPago; }
    public void       setTipoPago(Integer v)     { this.tipoPago = v; }
    public String     getNroOperacion() { return nroOperacion; }
    public void       setNroOperacion(String v)  { this.nroOperacion = v; }
    public BigDecimal getSubtotal()     { return subtotal; }
    public void       setSubtotal(BigDecimal v)  { this.subtotal = v; }
    public BigDecimal getEnvio()        { return envio; }
    public void       setEnvio(BigDecimal v)     { this.envio = v; }

    private BigDecimal descuento;
    private String     cupon;
    public BigDecimal getDescuento()    { return descuento; }
    public void       setDescuento(BigDecimal v) { this.descuento = v; }
    public String     getCupon()        { return cupon; }
    public void       setCupon(String v)         { this.cupon = v; }
    public BigDecimal getTotal()        { return total; }
    public void       setTotal(BigDecimal v)     { this.total = v; }
    public List<DetalleRequest> getItems() { return items; }
    public void setItems(List<DetalleRequest> v) { this.items = v; }
}
