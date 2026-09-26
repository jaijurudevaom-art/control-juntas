import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType } from 'docx'
import { buildHeader, buildFooter } from './helpers.js'
import { COLORS, FONT } from './theme.js'
import { fechaLarga, numeroCompleto, tituloParaFrase } from '../formatFecha.js'

// junta: {numero, tipo, fecha, anio}
// acuerdo: {numero_tema, titulo, desarrollo, consecutivo, anio, anexo_num}
export async function generarFichaTecnica({ junta, acuerdo }) {
  const header = await buildHeader()
  const footer = buildFooter()
  const tipoLabel = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'
  const numCompleto = numeroCompleto(acuerdo, junta.numero)

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ bold: true, font: FONT, size: 26, text: 'FICHA TÉCNICA DE ACUERDO' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          bold: true,
          font: FONT,
          size: 22,
          text: `Reunión ${tipoLabel} No. ${junta.numero} del Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila`,
        }),
      ],
    }),
    new Table({
      width: { size: 9500, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 4750, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
              },
              children: [
                new Paragraph({ children: [new TextRun({ bold: true, font: FONT, size: 20, text: 'Fecha de la junta' })] }),
                new Paragraph({ children: [new TextRun({ font: FONT, size: 20, text: fechaLarga(junta.fecha) })] }),
              ],
            }),
            new TableCell({
              width: { size: 4750, type: WidthType.DXA },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                left: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
                right: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
              },
              children: [
                new Paragraph({ children: [new TextRun({ bold: true, font: FONT, size: 20, text: 'Punto del orden del día' })] }),
                new Paragraph({ children: [new TextRun({ font: FONT, size: 20, text: acuerdo.numero_tema })] }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 240, after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'Tema' })] }),
    new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ font: FONT, size: 22, text: acuerdo.titulo })] }),
  ]

  if (acuerdo.desarrollo) {
    children.push(
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'Desarrollo' })] }),
      new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 200 }, children: [new TextRun({ font: FONT, size: 22, text: acuerdo.desarrollo })] })
    )
  }

  if (acuerdo.anexo_num) {
    children.push(
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ font: FONT, size: 22, text: `Documentación soporte integrada como Anexo No. ${acuerdo.anexo_num} del acta correspondiente.` })] })
    )
  }

  children.push(
    new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'Acuerdo' })] }),
    new Table({
      width: { size: 9500, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'EAF3EC' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.verde },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.verde },
                right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.verde },
                left: { style: BorderStyle.THICK, size: 24, color: COLORS.verde },
              },
              margins: { top: 160, bottom: 160, left: 200, right: 200 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      font: FONT,
                      size: 22,
                      text: `Acuerdo No. ${numCompleto} El Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila, aprueba ${tituloParaFrase(acuerdo.titulo)}.`,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  )

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1300, bottom: 1300, left: 1100, right: 1100 },
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
  })

  return Packer.toBlob(doc)
}
