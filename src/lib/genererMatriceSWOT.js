// src/lib/genererMatriceSWOT.js
//
// Génère une matrice SWOT (Forces/Faiblesses/Opportunités/Menaces) en Excel,
// en 2x2, prête à compléter. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'
const GREEN = 'FFE2F0D9'
const RED = 'FFFCE4E4'
const BLUE = 'FFE4ECF7'
const ORANGE = 'FFFDF0DA'

export async function genererMatriceSWOT({ client, fiche }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Matrice SWOT')

  ;['A', 'B'].forEach((col) => (ws.getColumn(col).width = 45))

  ws.mergeCells('A1:B1')
  ws.getCell('A1').value = `MATRICE SWOT — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:B2')
  ws.getCell('A2').value = fiche?.derniere_analyse_swot ? `Dernière analyse : ${new Date(fiche.derniere_analyse_swot).toLocaleDateString('fr-FR')}` : ''
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  const setQuadrant = (cellRef, titre, fill) => {
    const cell = ws.getCell(cellRef)
    cell.value = titre
    cell.font = { bold: true, color: { argb: WHITE }, size: 12 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { horizontal: 'center' }
  }

  setQuadrant('A4', 'FORCES (interne)', GREEN)
  setQuadrant('B4', 'FAIBLESSES (interne)', RED)
  setQuadrant('A12', 'OPPORTUNITÉS (externe)', BLUE)
  setQuadrant('B12', 'MENACES (externe)', ORANGE)

  const colorZone = (startRow, endRow, col, fill) => {
    for (let r = startRow; r <= endRow; r++) {
      ws.getCell(r, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
      ws.getCell(r, col).alignment = { wrapText: true, vertical: 'top' }
      ws.getRow(r).height = 22
    }
  }
  colorZone(5, 11, 1, GREEN)
  colorZone(5, 11, 2, RED)
  colorZone(13, 19, 1, BLUE)
  colorZone(13, 19, 2, ORANGE)

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Matrice_SWOT_${(client?.nom || 'organisation').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
