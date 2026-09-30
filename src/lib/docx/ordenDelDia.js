import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { buildHeader, buildFooter } from './helpers.js'
import { FONT } from './theme.js'
import { fechaLarga, horaSinSegundos } from '../formatFecha.js'

// junta: { numero, tipo, fecha, hora }
// puntos: array de jg_orden_dia_puntos ordenados (numero, texto)
// acuerdos: array de jg_acuerdos ordenados (numero_tema, titulo, retirado, motivo_retiro)
export async function generarOrdenDelDia({ junta, puntos, acuerdos }) {
  const header = await buildHeader()
  const footer = await buildFooter()

  const tipoLabel = junta.tipo === 'ordinaria' ? 'Ordinaria' : 'Extraordinaria'

  const puntosAntes = puntos.filter((p) => p.numero < 5).sort((a, b) => a.numero - b.numero)
  const puntosDespues = puntos.filter((p) => p.numero > 5).sort((a, b) => a.numero - b.numero)

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          bold: true,
          font: FONT,
          size: 24,
          text: `Reunión ${tipoLabel} No. ${junta.numero} del Consejo de Administración del Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila, celebrada a las ${horaSinSegundos(junta.hora)} horas del día ${fechaLarga(junta.fecha)}.`,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ bold: true, font: FONT, size: 24, text: 'Orden del día' })],
    }),
  ]

  let n = 1
  for (const p of puntosAntes) {
    children.push(
      new Paragraph({
        numbering: { reference: 'orden-dia-numeracion', level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 140 },
        children: [new TextRun({ font: FONT, size: 22, text: p.texto })],
      })
    )
    n++
  }

  children.push(
    new Paragraph({
      numbering: { reference: 'orden-dia-numeracion', level: 0 },
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140 },
      children: [new TextRun({ font: FONT, size: 22, text: 'Solicitud de acuerdos, presentación y en su caso aprobación de:' })],
    })
  )

  for (const a of acuerdos) {
    const runs = [
      new TextRun({ font: FONT, size: 22, bold: true, text: `${a.numero_tema} ` }),
      new TextRun({ font: FONT, size: 22, text: a.titulo }),
    ]
    if (a.retirado) {
      runs.push(
        new TextRun({
          font: FONT,
          size: 22,
          italics: true,
          text: ` ${a.motivo_retiro || 'Se retira del presente Orden del Día.'}`,
        })
      )
    }
    children.push(
      new Paragraph({
        indent: { left: 720 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 140 },
        children: runs,
      })
    )
  }

  for (const p of puntosDespues) {
    children.push(
      new Paragraph({
        numbering: { reference: 'orden-dia-numeracion', level: 0 },
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 140 },
        children: [new TextRun({ font: FONT, size: 22, text: p.texto })],
      })
    )
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'orden-dia-numeracion',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1.',
              alignment: AlignmentType.START,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
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
