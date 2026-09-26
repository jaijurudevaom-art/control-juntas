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
  ShadingType,
  VerticalAlign,
} from 'docx'
import { buildHeader, buildFooter } from './helpers.js'
import { COLORS, FONT } from './theme.js'
import { fechaLarga, horaAmPm, numeroCompleto, tituloParaFrase } from '../formatFecha.js'

const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: '999999' }
const cellBorders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder }

function asistentesTable(asistentes) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: ['Nombre', 'Cargo', 'Representación'].map(
      (t) =>
        new TableCell({
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLORS.verde },
          borders: cellBorders,
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', font: FONT, size: 20 })],
            }),
          ],
        })
    ),
  })

  const rows = asistentes.map(
    (a) =>
      new TableRow({
        children: [a.nombre, a.cargo || '', a.representacion || ''].map(
          (t) =>
            new TableCell({
              borders: cellBorders,
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: t, font: FONT, size: 20 })],
                }),
              ],
            })
        ),
      })
  )

  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    columnWidths: [3200, 3200, 3100],
    rows: [headerRow, ...rows],
  })
}

function acuerdoBox(texto) {
  return new Table({
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
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [new Paragraph({ children: [new TextRun({ font: FONT, size: 21, text: texto })] })],
          }),
        ],
      }),
    ],
  })
}

// junta: {numero, tipo, fecha, hora, lugar, hora_instalacion, hora_clausura, acta_anterior_omitida, asuntos_generales}
// asistentes: jg_integrantes[]
// puntos: jg_orden_dia_puntos[] (agenda fija)
// acuerdos: jg_acuerdos[] (con desarrollo, numero_tema, titulo, retirado, consecutivo, anio, anexo_num)
export async function generarActa({ junta, asistentes, puntos, acuerdos }) {
  const header = await buildHeader()
  const footer = buildFooter()
  const tipoLabel = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'

  const puntosAntes = puntos.filter((p) => p.numero < 5).sort((a, b) => a.numero - b.numero)
  const puntosDespues = puntos.filter((p) => p.numero > 5).sort((a, b) => a.numero - b.numero)

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ bold: true, font: FONT, size: 26, text: `ACTA DE SESIÓN ${tipoLabel.toUpperCase()}` })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ bold: true, font: FONT, size: 26, text: `No. ${junta.numero} del Consejo de Administración` })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({
          bold: true,
          font: FONT,
          size: 26,
          text: 'del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila',
        }),
      ],
    }),
    new Table({
      width: { size: 9500, type: WidthType.DXA },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {},
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 20, text: 'FECHA' })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: FONT, size: 20, text: fechaLarga(junta.fecha) })] }),
              ],
            }),
            new TableCell({
              borders: {},
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 20, text: 'HORA' })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: FONT, size: 20, text: `${junta.hora} horas` })] }),
              ],
            }),
            new TableCell({
              borders: {},
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 20, text: 'LUGAR' })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: FONT, size: 20, text: junta.lugar })] }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 240, after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'ASISTENTES' })] }),
    asistentesTable(asistentes),
    new Paragraph({
      spacing: { before: 240, after: 240 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          font: FONT,
          size: 22,
          text: `En la ciudad de Saltillo, capital del Estado de Coahuila de Zaragoza, siendo las ${junta.hora} horas del ${fechaLarga(junta.fecha)}, se reunieron en el ${junta.lugar}, los integrantes del Consejo de Administración, a fin de llevar a cabo la Reunión ${tipoLabel} del Consejo de Administración del Servicio Médico, bajo el siguiente orden del día.`,
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'ORDEN DEL DÍA' })] }),
  ]

  let n = 1
  for (const p of puntosAntes) {
    children.push(new Paragraph({ indent: { left: 400, hanging: 280 }, spacing: { after: 100 }, children: [new TextRun({ font: FONT, size: 22, text: `${n}. ${p.texto}` })] }))
    n++
  }
  children.push(new Paragraph({ indent: { left: 400, hanging: 280 }, spacing: { after: 100 }, children: [new TextRun({ font: FONT, size: 22, text: `${n}. Solicitud de acuerdos, presentación y en su caso aprobación de:` })] }))
  for (const a of acuerdos) {
    const runs = [new TextRun({ font: FONT, size: 22, text: `${a.numero_tema} ${a.titulo}` })]
    if (a.retirado) runs.push(new TextRun({ font: FONT, size: 22, italics: true, text: ` (RETIRADO — ${a.motivo_retiro || 'se atenderá posteriormente'})` }))
    children.push(new Paragraph({ indent: { left: 720 }, spacing: { after: 100 }, children: runs }))
  }
  n++
  for (const p of puntosDespues) {
    children.push(new Paragraph({ indent: { left: 400, hanging: 280 }, spacing: { after: 100 }, children: [new TextRun({ font: FONT, size: 22, text: `${n}. ${p.texto}` })] }))
    n++
  }

  children.push(
    new Paragraph({ spacing: { before: 280, after: 100 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: 'DESARROLLO DE LA SESIÓN' })] })
  )

  // Puntos 1-4 (bienvenida, pase de lista, instalación, lectura del acta anterior)
  const puntosDesarrollo = puntosAntes.map((p, idx) => ({ numero: idx + 1, texto: p.texto, desarrollo: p.desarrollo }))
  for (const p of puntosDesarrollo) {
    children.push(
      new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: `${p.numero}. ${p.texto}` })] })
    )
    if (p.desarrollo) {
      children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ font: FONT, size: 22, text: p.desarrollo })] }))
    }
  }

  children.push(
    new Paragraph({ spacing: { before: 160, after: 120 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: '5. Solicitud de acuerdos, presentación y en su caso aprobación de:' })] })
  )

  for (const a of acuerdos) {
    children.push(
      new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: `${a.numero_tema}.- ${a.titulo}` })] })
    )
    if (a.desarrollo) {
      children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ font: FONT, size: 22, text: a.desarrollo })] }))
    }
    if (a.retirado) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 160 },
          children: [new TextRun({ font: FONT, size: 22, italics: true, text: a.motivo_retiro || 'Este punto fue retirado del orden del día.' })],
        })
      )
    } else {
      if (a.anexo_num) {
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ font: FONT, size: 22, text: `Quedando integrado como Anexo No. ${a.anexo_num}.` })],
          })
        )
      }
      const numCompleto = numeroCompleto(a, junta.numero)
      children.push(
        acuerdoBox(
          `Acuerdo No. ${numCompleto} El Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila, aprueba ${tituloParaFrase(a.titulo)}.`
        )
      )
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }))
    }
  }

  const puntosFin = puntosDespues.map((p, idx) => ({ numero: n - puntosDespues.length + idx, texto: p.texto, desarrollo: p.desarrollo }))
  for (const p of puntosFin) {
    children.push(
      new Paragraph({ spacing: { before: 160, after: 60 }, children: [new TextRun({ bold: true, font: FONT, size: 22, text: `${p.numero}. ${p.texto}` })] })
    )
    if (p.numero === puntosFin[0]?.numero && junta.asuntos_generales) {
      children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ font: FONT, size: 22, text: junta.asuntos_generales })] }))
    } else if (p.desarrollo) {
      children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 }, children: [new TextRun({ font: FONT, size: 22, text: p.desarrollo })] }))
    }
  }

  if (junta.hora_clausura) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { before: 160, after: 300 },
        children: [
          new TextRun({
            font: FONT,
            size: 22,
            text: `Se procede a la clausura de esta reunión ${tipoLabel.toLowerCase()}, siendo las ${horaAmPm(junta.hora_clausura)} horas del día ${fechaLarga(junta.fecha)}.`,
          }),
        ],
      })
    )
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          bold: true,
          font: FONT,
          size: 22,
          text: 'Por El Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila',
        }),
      ],
    })
  )

  // Bloque de firmas: dos columnas usando tabla sin bordes
  const firmaTableRows = []
  for (let i = 0; i < asistentes.length; i += 2) {
    const izq = asistentes[i]
    const der = asistentes[i + 1]
    const celda = (persona) =>
      new TableCell({
        borders: {},
        children: persona
          ? [
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500, after: 20 }, children: [new TextRun({ font: FONT, size: 20, text: '_____________________________' })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ bold: true, font: FONT, size: 20, text: persona.nombre })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ font: FONT, size: 18, text: persona.representacion || persona.cargo || '' })] }),
            ]
          : [new Paragraph({ children: [] })],
      })
    firmaTableRows.push(new TableRow({ children: [celda(izq), celda(der)] }))
  }
  children.push(new Table({ width: { size: 9500, type: WidthType.DXA }, rows: firmaTableRows }))

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
