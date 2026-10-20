export interface LoginRequest { correo: string; clave: string; }
export interface LoginResponse { token: string; usuario: Usuario; }

export interface Usuario {
  idusuario:  number;
  nombres:    string;
  apellidos:  string;
  dni:        string;
  correo:     string;
  clave?:     string;
  celular?:   string;
  iddistrito: number;
  direccion:  string;
  rol:        number;   // 1=ADMIN | 2=CLIENTE | 3=VENDEDOR
  estado:     number;
  fecha_reg?: string;
}

/** Payload para registrar un nuevo cliente desde la tienda */
export interface RegistroClienteRequest {
  nombres:    string;
  apellidos:  string;
  dni:        string;
  correo:     string;
  clave:      string;
  celular?:   string;
  telefono?:  string;
  direccion?: string;
  iddistrito?: number;
}

export interface Categoria {
  idcategoria:        number;
  descripcion:        string;
  estado:             number;
  cantidadProductos?: number;
}

export interface TallasConfig {
  casaca?: string[];
  zapato?: number[];
}

export interface Producto {
  idproducto:       number;
  descripcion:      string;
  precio:           number;
  stock:            number;
  imagen:           string;
  categoria?:       Categoria;
  idcategoria?:     number;
  estado:           number;
  talla_json?:      string;
  caracteristicas?: string;
  tallasConfig?:    TallasConfig;
}

export interface Distrito {
  iddistrito:  number;
  descripcion: string;
}

export interface DetalleBoletaRequest { idProducto: number; cantidad: number; precio: number; }
export interface BoletaRequest {
  idUsuario: number; idDistrito: number; direccion: string;
  tipoPago: number; nroOperacion: string;
  subtotal: number; envio: number; total: number;
  items: DetalleBoletaRequest[];
}
export interface BoletaResponse { success: boolean; mensaje: string; idBoleta: number; }

export interface BoletaHistorial {
  idboleta:       number;
  fecha:          string;
  tipoPago:       number;
  estado:         number;
  importe_total:  number;
  importe_envio?: number;
  nroOperacion?:  string;
  nombreCliente?: string;
  correoCliente?: string;
  direccionEnvio?:string;
  distrito?:      string;
}

export interface BoletaDetalle {
  idboleta:         number;
  fecha:            string;
  estado:           number;
  tipoPago:         number;
  nroOperacion?:    string;
  direccionEnvio?:  string;
  distrito?:        string;
  nombreCliente?:   string;
  correoCliente?:   string;
  importeProductos: number;
  importeEnvio:     number;
  importeNeto:      number;
  importeIgv:       number;
  importeTotal:     number;
  items:            BoletaDetalleItem[];
}

export interface BoletaDetalleItem {
  idproducto:  number;
  descripcion: string;
  imagen?:     string;
  cantidad:    number;
  preciovta:   number;
  importe:     number;
}

export interface DashboardDTO {
  totalUsuarios:    number;
  totalProductos:   number;
  totalBoletas:     number;
  gananciasTotales: number;
}

export interface CrearVendedorRequest {
  nombres: string; apellidos: string; dni: string; correo: string;
  clave: string; celular?: string; iddistrito: number; direccion: string;
}
