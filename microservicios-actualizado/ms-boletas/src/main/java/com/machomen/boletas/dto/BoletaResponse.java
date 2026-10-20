package com.machomen.boletas.dto;
public class BoletaResponse {
    private boolean success; private String mensaje; private Integer idBoleta;
    public BoletaResponse(boolean s, String m, Integer id) { this.success=s; this.mensaje=m; this.idBoleta=id; }
    public boolean isSuccess()  { return success;  } public String getMensaje()  { return mensaje;  } public Integer getIdBoleta() { return idBoleta; }
}
