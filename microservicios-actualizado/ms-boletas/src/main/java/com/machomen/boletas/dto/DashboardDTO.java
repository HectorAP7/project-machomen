package com.machomen.boletas.dto;
public class DashboardDTO {
    private long totalUsuarios; private long totalProductos; private long totalBoletas; private double gananciasTotales;
    public DashboardDTO(long u, long p, long b, double g) { totalUsuarios=u; totalProductos=p; totalBoletas=b; gananciasTotales=g; }
    public long getTotalUsuarios()    { return totalUsuarios;    }
    public long getTotalProductos()   { return totalProductos;   }
    public long getTotalBoletas()     { return totalBoletas;     }
    public double getGananciasTotales(){ return gananciasTotales; }
}
