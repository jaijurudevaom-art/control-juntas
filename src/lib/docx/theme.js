// Paleta y helpers compartidos para replicar el formato institucional de ISMMTEC
export const COLORS = {
  verde: '1E8449', // verde institucional (encabezados de tabla, acentos)
  verdeOscuro: '145A32',
  negro: '000000',
  grisTexto: '000000',
  barraNaranja: 'F7941D',
  barraMagenta: 'EC008C',
  barraCian: '00AEEF',
  barraVerde: '39B54A',
}

export const FONT = 'Calibri'

// Dimensiones página carta (DXA)
export const PAGE = {
  width: 12240,
  height: 15840,
  margin: {
    top: 1300,
    bottom: 1300,
    left: 1100,
    right: 1100,
  },
}

export const LOGO_PATH = new URL('../../assets/letterhead/letterhead-banner.jpg', import.meta.url).href
