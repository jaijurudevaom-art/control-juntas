import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { buildHeader, buildFooter } from './helpers.js'
import { FONT } from './theme.js'
import { fechaLarga, horaAmPm } from '../formatFecha.js'

// junta: {numero, tipo, fecha, hora}
// asistentes: array de jg_integrantes (nombre, cargo, representacion) que asistieron
export async function generarListaAsistencia({ junta, asistentes }) {
  const header = await buildHeader()
  const footer = await buildFooter()
  const tipoLabel = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          bold: true,
          font: FONT,
          size: 24,
          text: `Reunión ${tipoLabel} No. ${junta.numero} del Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila, celebrada a las ${horaAmPm(junta.hora)} horas del día ${fechaLarga(junta.fecha)}.`,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [new TextRun({ bold: true, font: FONT, size: 24, text: 'LISTA DE ASISTENCIA' })],
    }),
  ]

  for (const a of asistentes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 20 },
        children: [new TextRun({ bold: true, font: FONT, size: 22, text: a.nombre })],
      })
    )
    const linea2 = [a.cargo, a.representacion].filter(Boolean).join('\n')
    for (const line of linea2.split('\n')) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 20 },
          children: [new TextRun({ font: FONT, size: 22, text: line })],
        })
      )
    }
  }

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
