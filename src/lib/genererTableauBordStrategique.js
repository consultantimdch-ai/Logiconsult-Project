// src/lib/genererTableauBordStrategique.js
//
// Génère le tableau de bord stratégique (Excel) : axes stratégiques,
// objectifs, indicateurs, cibles. Canevas à compléter, pré-rempli avec
// les axes déjà saisis dans la fiche stratégique. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'

export async function genererTableauBordStrategique({ client, fiche }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Tableau de bord stratégique')

  const widths = [30, 34, 26, 14, 14, 14]
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))

  ws.mergeCells('A1:F1')
  ws.getCell('A1').value = `TABLEAU DE BORD STRATÉGIQUE — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }

  const headerRow = 3
  ;['Axe stratégique', 'Objectif', 'Indicateur', 'Cible', 'Valeur actuelle', 'Statut'].forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { wrapText: true, vertical: 'middle' }
  })

  // Pré-remplissage des axes déjà saisis (une ligne par axe, à détailler)
  const axes = (fiche?.axes_strategiques || '')
    .split(/\n|;/)
    .map((a) => a.trim())
    .filter(Boolean)

  const lignes = axes.length > 0 ? axes : ['']
  lignes.forEach((axe, i) => {
    const r = headerRow + 1 + i
    ws.getCell(r, 1).value = axe
    ws.getCell(r, 4).value = null
    ws.getCell(r, 5).value = null
    ws.getCell(r, 6).value = {
      formula: `IF(OR(D${r}="",E${r}=""),"",IF(E${r}/D${r}>=0.9,"Atteint",IF(E${r}/D${r}>=0.5,"En cours","À risque")))`,
    }
  })

  for (let i = 0; i < 5; i++) {
    const r = headerRow + 1 + lignes.length + i
    ws.getCell(r, 6).value = {
      formula: `IF(OR(D${r}="",E${r}=""),"",IF(E${r}/D${r}>=0.9,"Atteint",IF(E${r}/D${r}>=0.5,"En cours","À risque")))`,
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Tableau_bord_strategique_${(client?.nom || 'organisation').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
