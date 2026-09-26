// src/lib/genererRegistreRisques.js
//
// Génère un registre des risques (canevas avec exemples), avec niveau de
// risque calculé automatiquement (probabilité x impact). À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'

const EXEMPLES = [
  ['Retard de décaissement du bailleur', 'Financier', 3, 3, 'Anticiper une trésorerie de réserve ; suivre le calendrier de décaissement', 'Chef de projet'],
  ['Turnover du personnel clé', 'Ressources humaines', 2, 3, 'Plan de formation croisée ; documentation des processus', 'Coordination'],
  ['Insécurité dans la zone d\u2019intervention', 'Contextuel', 2, 4, 'Suivi du contexte sécuritaire ; plan de contingence', 'Direction'],
]

export async function genererRegistreRisques({ client, fiche }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Registre des risques')

  const widths = [32, 16, 12, 10, 12, 40, 18]
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))

  ws.mergeCells('A1:G1')
  ws.getCell('A1').value = `REGISTRE DES RISQUES — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:G2')
  ws.getCell('A2').value = fiche?.nom_projet ? `Projet : ${fiche.nom_projet}` : ''
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }
  ws.mergeCells('A3:G3')
  ws.getCell('A3').value = 'Probabilité et Impact notés de 1 (faible) à 4 (élevé). Niveau = Probabilité × Impact.'
  ws.getCell('A3').font = { italic: true, size: 9, color: { argb: 'FF999999' } }

  const headerRow = 5
  ;['Risque identifié', 'Catégorie', 'Probabilité (1-4)', 'Impact (1-4)', 'Niveau', 'Mesures de mitigation', 'Responsable'].forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { wrapText: true, vertical: 'middle' }
  })

  EXEMPLES.forEach((ex, i) => {
    const r = headerRow + 1 + i
    ws.getCell(r, 1).value = ex[0]
    ws.getCell(r, 2).value = ex[1]
    ws.getCell(r, 3).value = ex[2]
    ws.getCell(r, 4).value = ex[3]
    ws.getCell(r, 5).value = { formula: `C${r}*D${r}` }
    ws.getCell(r, 6).value = ex[4]
    ws.getCell(r, 7).value = ex[5]
  })

  // lignes vides supplémentaires prêtes à l'emploi
  for (let i = 0; i < 5; i++) {
    const r = headerRow + 1 + EXEMPLES.length + i
    ws.getCell(r, 5).value = { formula: `IFERROR(C${r}*D${r},"")` }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Registre_risques_${(client?.nom || 'projet').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
