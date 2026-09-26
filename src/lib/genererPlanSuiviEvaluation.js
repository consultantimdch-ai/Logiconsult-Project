// src/lib/genererPlanSuiviEvaluation.js
//
// Génère le plan de suivi-évaluation (MEAL), directement à partir des
// indicateurs déjà saisis pour la mission. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'

export async function genererPlanSuiviEvaluation({ client, fiche, indicateurs }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Plan S&E')

  const widths = [16, 32, 10, 12, 12, 14, 20, 22, 16]
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))

  ws.mergeCells('A1:I1')
  ws.getCell('A1').value = `PLAN DE SUIVI-ÉVALUATION (MEAL) — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:I2')
  ws.getCell('A2').value = fiche?.nom_projet ? `Projet : ${fiche.nom_projet}` : ''
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  const headerRow = 4
  ;['Résultat/Axe', 'Indicateur', 'Unité', 'Cible', 'Valeur de référence (baseline)', 'Fréquence de collecte', 'Méthode de collecte', 'Source de vérification', 'Responsable'].forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { wrapText: true, vertical: 'middle' }
  })

  const rows = indicateurs && indicateurs.length > 0 ? indicateurs : [{}]
  rows.forEach((ind, i) => {
    const r = headerRow + 1 + i
    ws.getCell(r, 1).value = ind.resultat_axe || ''
    ws.getCell(r, 2).value = ind.indicateur || ''
    ws.getCell(r, 3).value = ind.unite || ''
    ws.getCell(r, 4).value = ind.cible ?? null
    ws.getCell(r, 5).value = null // baseline non capturée à l'audit, à compléter
    ws.getCell(r, 6).value = ind.frequence || ''
    ws.getCell(r, 7).value = '' // méthode de collecte, à préciser
    ws.getCell(r, 8).value = ind.source_verification || ''
    ws.getCell(r, 9).value = ind.responsable || ''
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Plan_suivi_evaluation_${(client?.nom || 'projet').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
