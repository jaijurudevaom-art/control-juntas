import {
  Header,
  Footer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  AlignmentType,
  BorderStyle,
  HeightRule,
} from 'docx'
import { COLORS, FONT, LOGO_PATH } from './theme.js'

let cachedLogoBuffer = null
let logoFailed = false
async function getLogoBuffer() {
  if (cachedLogoBuffer) return cachedLogoBuffer
  if (logoFailed) return null
  try {
    const res = await fetch(LOGO_PATH)
    if (!res.ok) throw new Error('logo fetch failed')
    const buf = await res.arrayBuffer()
    cachedLogoBuffer = new Uint8Array(buf)
    return cachedLogoBuffer
  } catch {
    logoFailed = true
    return null
  }
}

// Encabezado institucional: banner con logo de Coahuila + ISMMTEC a todo lo ancho
// (si el logo no está disponible, cae a un encabezado de texto para no romper la generación)
export async function buildHeader() {
  const logo = await getLogoBuffer()
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: logo
          ? [
              new ImageRun({
                data: logo,
                type: 'jpg',
                transformation: { width: 600, height: 98 },
              }),
            ]
          : [
              new TextRun({
                text: 'Instituto de Servicio Médico para los Trabajadores de la Educación del Estado de Coahuila',
                bold: true,
                font: FONT,
                size: 18,
              }),
            ],
      }),
    ],
  })
}

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }

function colorBarCell(color) {
  return new TableCell({
    width: { size: 2500, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: color },
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: [new Paragraph({ children: [] })],
  })
}

// Pie de página institucional: barra de color + domicilio/teléfono
export function buildFooter() {
  return new Footer({
    children: [
      new Table({
        width: { size: 10000, type: WidthType.DXA },
        rows: [
          new TableRow({
            height: { value: 40, rule: HeightRule.EXACT },
            children: [
              colorBarCell(COLORS.barraNaranja),
              colorBarCell(COLORS.barraMagenta),
              colorBarCell(COLORS.barraCian),
              colorBarCell(COLORS.barraVerde),
            ],
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60 },
        children: [
          new TextRun({
            text: 'BLVD. LOS ÁLAMOS No. 3685 - 3 COL. SAN JOSÉ DE LOS CERRITOS C.P. 25294   TEL. (844) 438-04-40   SALTILLO, COAH., MÉXICO',
            color: COLORS.verde,
            size: 14,
            bold: true,
            font: FONT,
          }),
        ],
      }),
    ],
  })
}

export function titleParagraph(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120, ...opts.spacing },
    children: [
      new TextRun({ text, bold: true, size: opts.size || 26, font: FONT }),
    ],
  })
}

export function bodyParagraph(runs, opts = {}) {
  const children = Array.isArray(runs)
    ? runs.map((r) => (typeof r === 'string' ? new TextRun({ text: r, font: FONT, size: 22 }) : r))
    : [new TextRun({ text: runs, font: FONT, size: 22 })]
  return new Paragraph({
    spacing: { after: 160, line: 276, ...opts.spacing },
    alignment: opts.alignment,
    indent: opts.indent,
    children,
  })
}

export { AlignmentType, WidthType, ShadingType, BorderStyle, HeightRule, Table, TableRow, TableCell, Paragraph, TextRun, ImageRun }
