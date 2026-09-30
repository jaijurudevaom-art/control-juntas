import { Header, Footer, Paragraph, TextRun, ImageRun, AlignmentType } from 'docx'
import { FONT, LOGO_PATH, FOOTER_LOGO_PATH } from './theme.js'

function bufferCacher(path) {
  let cached = null
  let failed = false
  return async function get() {
    if (cached) return cached
    if (failed) return null
    try {
      const res = await fetch(path)
      if (!res.ok) throw new Error('image fetch failed')
      const buf = await res.arrayBuffer()
      cached = new Uint8Array(buf)
      return cached
    } catch {
      failed = true
      return null
    }
  }
}

const getLogoBuffer = bufferCacher(LOGO_PATH)
const getFooterLogoBuffer = bufferCacher(FOOTER_LOGO_PATH)

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

// Pie de página institucional: imagen oficial (barra de color + logo + domicilio/teléfono)
// Si la imagen no está disponible, cae a un pie de texto para no romper la generación.
export async function buildFooter() {
  const logo = await getFooterLogoBuffer()
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: logo
          ? [
              new ImageRun({
                data: logo,
                type: 'jpg',
                transformation: { width: 600, height: 73 },
              }),
            ]
          : [
              new TextRun({
                text: 'BLVD. LOS ÁLAMOS No. 3685 - 3 COL. SAN JOSÉ DE LOS CERRITOS C.P. 25294   TEL. (844) 438-04-40   SALTILLO, COAH., MÉXICO',
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

export { AlignmentType, Paragraph, TextRun, ImageRun }
