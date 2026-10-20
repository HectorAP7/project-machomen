package com.machomen.productos.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_cupon")
public class Cupon {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idcupon;

    private String     codigo;
    private Integer    tipo;     // 1 = porcentaje, 2 = monto fijo
    private BigDecimal valor;
    private BigDecimal minimo;
    private Integer    usos_max;
    private Integer    usos;
    private Integer    estado;

    public Integer getIdcupon() { return idcupon; }
    public void setIdcupon(Integer v) { this.idcupon = v; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String v) { this.codigo = v; }
    public Integer getTipo() { return tipo; }
    public void setTipo(Integer v) { this.tipo = v; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal v) { this.valor = v; }
    public BigDecimal getMinimo() { return minimo; }
    public void setMinimo(BigDecimal v) { this.minimo = v; }
    public Integer getUsos_max() { return usos_max; }
    public void setUsos_max(Integer v) { this.usos_max = v; }
    public Integer getUsos() { return usos; }
    public void setUsos(Integer v) { this.usos = v; }
    public Integer getEstado() { return estado; }
    public void setEstado(Integer v) { this.estado = v; }
}
