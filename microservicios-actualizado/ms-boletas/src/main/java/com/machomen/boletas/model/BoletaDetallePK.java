package com.machomen.boletas.model;
import java.io.Serializable;
import java.util.Objects;
public class BoletaDetallePK implements Serializable {
    private static final long serialVersionUID = 1L;
    private Integer idboleta;
    private Integer idproducto;
    public BoletaDetallePK() {}
    public BoletaDetallePK(Integer idboleta, Integer idproducto) { this.idboleta = idboleta; this.idproducto = idproducto; }
    public Integer getIdboleta() { return idboleta; }
    public void setIdboleta(Integer v) { this.idboleta = v; }
    public Integer getIdproducto() { return idproducto; }
    public void setIdproducto(Integer v) { this.idproducto = v; }
    @Override public boolean equals(Object o) { if (!(o instanceof BoletaDetallePK)) return false; BoletaDetallePK t = (BoletaDetallePK)o; return Objects.equals(idboleta,t.idboleta)&&Objects.equals(idproducto,t.idproducto); }
    @Override public int hashCode() { return Objects.hash(idboleta,idproducto); }
}
