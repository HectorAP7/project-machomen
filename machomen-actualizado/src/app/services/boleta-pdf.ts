import { Injectable } from '@angular/core';

declare const jspdf: any;

/**
 * Genera el PDF de la boleta usando jsPDF + autoTable (cargados via CDN en index.html).
 * Se invoca desde el detalle del cliente, admin y vendedor.
 */
@Injectable({ providedIn: 'root' })
export class BoletaPdfService {

  /** Genera y descarga el PDF de la boleta. `boleta` viene del endpoint /api/boletas/detalle/{id} */
  descargar(boleta: any): void {
    if (!boleta) return;

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    // ── Colores ──────────────────────────────────────────────────────────────
    const ORO = [201, 168, 76];
    const NEGRO = [17, 17, 17];
    const GRIS = [120, 120, 120];

    // ── Encabezado: marca ────────────────────────────────────────────────────
    doc.setFillColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(ORO[0], ORO[1], ORO[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MACHOMEN', 15, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('LEATHER · MEN\'S FASHION', 15, 22);

    // Nro de boleta
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`BOLETA Nº ${boleta.idboleta}`, 195, 16, { align: 'right' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(this.fmtFecha(boleta.fecha), 195, 22, { align: 'right' });

    // ── Datos empresa ────────────────────────────────────────────────────────
    let y = 38;
    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MachoMen Leather S.A.C.', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text('RUC: 20612345678', 15, y + 5);
    doc.text('Av. Larco 1020, Miraflores - Lima', 15, y + 10);
    doc.text('contacto@machomen.com  ·  +51 999 000 111', 15, y + 15);

    // Estado
    const estadoTxt = this.estadoLabel(boleta.estado);
    const estadoColor = boleta.estado === 2 ? [21, 128, 61] : boleta.estado === 3 ? [185, 28, 28] : [146, 64, 14];
    const estadoBg = boleta.estado === 2 ? [220, 252, 231] : boleta.estado === 3 ? [254, 226, 226] : [254, 243, 199];
    doc.setFillColor(estadoBg[0], estadoBg[1], estadoBg[2]);
    doc.rect(155, y - 4, 40, 9, 'F');
    doc.setTextColor(estadoColor[0], estadoColor[1], estadoColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(estadoTxt.toUpperCase(), 175, y + 1.5, { align: 'center' });

    // ── Datos cliente ────────────────────────────────────────────────────────
    y = 62;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, y - 3, 195, y - 3);

    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('CLIENTE', 15, y);
    doc.text('DIRECCIÓN DE ENVÍO', 110, y);

    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(boleta.nombreCliente ?? '—', 15, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(boleta.correoCliente ?? '', 15, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    const dir = boleta.direccionEnvio ?? '—';
    doc.text(dir.substring(0, 50), 110, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(boleta.distrito ?? '', 110, y + 11);

    // Método de pago
    y += 22;
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('MÉTODO DE PAGO', 15, y);
    doc.text('Nº DE OPERACIÓN', 110, y);

    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(this.tipoPagoLabel(boleta.tipoPago), 15, y + 6);
    doc.text(boleta.nroOperacion ?? '—', 110, y + 6);

    // ── Tabla de productos ──────────────────────────────────────────────────
    y += 14;
    const items = boleta.items ?? [];
    const filas = items.map((it: any) => [
      it.descripcion ?? `Producto #${it.idproducto}`,
      it.talla ? String(it.talla) : '—',
      String(it.cantidad ?? 1),
      `S/ ${this.fmt(it.preciovta)}`,
      `S/ ${this.fmt(it.importe)}`
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['Producto', 'Talla', 'Cant.', 'Precio', 'Importe']],
      body: filas,
      theme: 'striped',
      headStyles: { fillColor: NEGRO, textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'left' },
      bodyStyles: { fontSize: 9, textColor: 40 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'right',  cellWidth: 30 },
        4: { halign: 'right',  cellWidth: 30, fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 }
    });

    // ── Totales ──────────────────────────────────────────────────────────────
    let yFinal = (doc as any).lastAutoTable.finalY + 8;
    const xLabel = 130;
    const xVal = 195;

    doc.setFontSize(9);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', xLabel, yFinal);
    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.text(`S/ ${this.fmt(boleta.importeProductos)}`, xVal, yFinal, { align: 'right' });
    yFinal += 5;

    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text('Envío:', xLabel, yFinal);
    const envio = Number(boleta.importeEnvio);
    if (envio === 0) {
      doc.setTextColor(21, 128, 61);
      doc.setFont('helvetica', 'bold');
      doc.text('GRATIS', xVal, yFinal, { align: 'right' });
    } else {
      doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
      doc.text(`S/ ${this.fmt(boleta.importeEnvio)}`, xVal, yFinal, { align: 'right' });
    }
    yFinal += 5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.text('IGV (18%):', xLabel, yFinal);
    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.text(`S/ ${this.fmt(boleta.importeIgv)}`, xVal, yFinal, { align: 'right' });
    yFinal += 7;

    // Línea separadora
    doc.setDrawColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.setLineWidth(0.5);
    doc.line(xLabel, yFinal - 4, xVal, yFinal - 4);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(NEGRO[0], NEGRO[1], NEGRO[2]);
    doc.text('TOTAL:', xLabel, yFinal + 2);
    doc.setTextColor(ORO[0], ORO[1], ORO[2]);
    doc.text(`S/ ${this.fmt(boleta.importeTotal)}`, xVal, yFinal + 2, { align: 'right' });

    // ── Footer ──────────────────────────────────────────────────────────────
    doc.setFontSize(8);
    doc.setTextColor(GRIS[0], GRIS[1], GRIS[2]);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por confiar en MachoMen. Esta boleta es válida como comprobante de compra.', 105, 285, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('www.machomen.com  ·  Hecho con orgullo en Lima, Perú', 105, 290, { align: 'center' });

    // ── Descargar ───────────────────────────────────────────────────────────
    doc.save(`Boleta-MachoMen-${boleta.idboleta}.pdf`);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private fmt(n: any): string {
    return Number(n ?? 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private fmtFecha(f: any): string {
    if (!f) return '';
    try {
      return new Date(f).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return String(f); }
  }

  private estadoLabel(e: number): string {
    return ({ 1: 'Pendiente', 2: 'Aprobado', 3: 'Anulado' } as any)[e] ?? '—';
  }

  private tipoPagoLabel(t: number): string {
    return ({ 1: 'Yape', 2: 'Plin', 3: 'Tarjeta' } as any)[t] ?? 'Otro';
  }
}
