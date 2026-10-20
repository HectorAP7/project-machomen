-- ════════════════════════════════════════════════════════════
-- MACHOMEN · Tabla de CUPONES de descuento
-- Ejecutar en la base de datos de ms-productos (la misma del catálogo)
-- ════════════════════════════════════════════════════════════

CREATE TABLE tb_cupon (
    idcupon     INT          AUTO_INCREMENT PRIMARY KEY,
    codigo      VARCHAR(30)  NOT NULL UNIQUE,        -- ej: MACHO10
    tipo        INT          NOT NULL DEFAULT 1,     -- 1 = porcentaje (%), 2 = monto fijo (S/)
    valor       DECIMAL(10,2) NOT NULL,              -- 10 (=10%)  o  20.00 (=S/20)
    minimo      DECIMAL(10,2) DEFAULT 0,             -- compra mínima para usarlo
    usos_max    INT          DEFAULT 0,              -- 0 = ilimitado
    usos        INT          DEFAULT 0,              -- veces usado
    estado      INT          DEFAULT 1               -- 1 = activo, 0 = inactivo
);

-- Cupones de ejemplo
INSERT INTO tb_cupon (codigo, tipo, valor, minimo, usos_max, estado) VALUES
('MACHO10',  1, 10.00, 0,   0, 1),   -- 10% de descuento
('BIENVENIDO',1, 15.00, 200, 0, 1),  -- 15% en compras desde S/200
('CUERO20',  2, 20.00, 150, 0, 1);   -- S/20 off en compras desde S/150
