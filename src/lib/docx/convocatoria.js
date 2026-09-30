import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  PageBreak,
} from 'docx'
import { buildHeader, buildFooter } from './helpers.js'
import { FONT } from './theme.js'
import { fechaLarga, fechaConDia, horaAmPm } from '../formatFecha.js'

const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: '000000' }
const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder }

function oficioTable({ destinatarioNombre, destinatarioCargo, numeroOficio, anio, asunto }) {
  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [6500, 3000],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 6500, type: WidthType.DXA },
            borders,
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ bold: true, font: FONT, size: 22, text: destinatarioNombre.toUpperCase() })],
              }),
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ bold: true, font: FONT, size: 22, text: (destinatarioCargo || '').toUpperCase() })],
              }),
              new Paragraph({
                children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'PRESENTE.-' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            borders,
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ bold: true, font: FONT, size: 22, text: `Oficio No. ${numeroOficio}/${anio}` })],
              }),
              new Paragraph({
                children: [
                  new TextRun({ bold: true, font: FONT, size: 22, text: 'Asunto: ' }),
                  new TextRun({ font: FONT, size: 22, text: asunto }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

// junta: {numero, tipo, fecha, hora, lugar}
// destinatarios: [{integrante, numero_oficio, fecha_oficio}]
// puntos + acuerdos: orden del día completo (misma agenda para todos)
// presidenta: {nombre, cargo}
export async function generarConvocatoria({ junta, destinatarios, puntos, acuerdos, presidenta, fechaEmision }) {
  const header = await buildHeader()
  const footer = await buildFooter()
  const tipoLabel = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'
  const asunto = `Reunión ${tipoLabel} No. ${junta.numero} de Consejo de Administración`

  const puntosAntes = puntos.filter((p) => p.numero < 5).sort((a, b) => a.numero - b.numero)
  const puntosDespues = puntos.filter((p) => p.numero > 5).sort((a, b) => a.numero - b.numero)

  const sections = destinatarios.map((d, idx) => {
    const children = []
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ font: FONT, size: 22, text: fechaLarga(fechaEmision) })],
      }),
      oficioTable({
        destinatarioNombre: d.integrante.nombre,
        destinatarioCargo: d.integrante.representacion || d.integrante.cargo,
        numeroOficio: d.numero_oficio,
        anio: junta.anio,
        asunto,
      }),
      new Paragraph({ spacing: { before: 200, after: 160 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 200, line: 300 },
        children: [
          new TextRun({
            font: FONT,
            size: 22,
            text: `Por este conducto se convoca a la Reunión ${tipoLabel} No. ${junta.numero} del Consejo de Administración del Instituto del Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila, el día ${fechaConDia(junta.fecha)} a las ${horaAmPm(junta.hora)} horas en el ${junta.lugar}, bajo el siguiente Orden del día:`,
          }),
        ],
      })
    )

    let numero = 1
    for (const p of puntosAntes) {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          indent: { left: 400, hanging: 280 },
          children: [new TextRun({ font: FONT, size: 22, text: `${numero}. ${p.texto}` })],
        })
      )
      numero++
    }
    children.push(
      new Paragraph({
        spacing: { after: 140 },
        indent: { left: 400, hanging: 280 },
        children: [new TextRun({ font: FONT, size: 22, text: `${numero}. Solicitud de acuerdos, presentación y en su caso aprobación de:` })],
      })
    )
    for (const a of acuerdos) {
      const runs = [new TextRun({ font: FONT, size: 22, bold: true, text: `${a.numero_tema} ` }), new TextRun({ font: FONT, size: 22, text: a.titulo })]
      if (a.retirado) {
        runs.push(new TextRun({ font: FONT, size: 22, italics: true, text: ` ${a.motivo_retiro || ''}` }))
      }
      children.push(new Paragraph({ indent: { left: 720 }, spacing: { after: 140 }, children: runs }))
    }
    numero++
    for (const p of puntosDespues) {
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          indent: { left: 400, hanging: 280 },
          children: [new TextRun({ font: FONT, size: 22, text: `${numero}. ${p.texto}` })],
        })
      )
      numero++
    }

    children.push(
      new Paragraph({ spacing: { before: 300 }, alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'Atentamente' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ font: FONT, size: 22, text: '_____________________________' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 22, text: presidenta.nombre })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: idx < destinatarios.length - 1 ? 0 : 0 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: presidenta.cargo })] })
    )

    if (idx < destinatarios.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    return children
  })

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
        children: sections.flat(),
      },
    ],
  })

  return Packer.toBlob(doc)
}
