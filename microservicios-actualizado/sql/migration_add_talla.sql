-- MachoMen — Migration: Agregar columna talla a tb_boleta_det
-- Ejecutar una sola vez en la base de datos bd_machomen

USE bd_machomen;

-- Agregar columna talla (NULL para boletas existentes)
ALTER TABLE tb_boleta_det
ADD COLUMN talla VARCHAR(10) NULL COMMENT 'Talla seleccionada por el cliente (ej: S, M, L, XL, 38, 40)'
AFTER importe;

-- Verificar
DESCRIBE tb_boleta_det;
