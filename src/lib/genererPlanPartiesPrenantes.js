// src/lib/genererPlanPartiesPrenantes.js
//
// Génère le plan de gestion des parties prenantes (canevas avec exemples).
// À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'

const EXEMPLES = [
  ['Bailleur de fonds', 'Redevabilité, atteinte des résultats', 'Élevé', 'Élevé', 'Rapports périodiques, réunions de suivi trimestrielles'],
  ['Bénéficiaires', 'Qualité et pertinence des activités', 'Faible', 'Élevé', 'Consultations régulières, mécanisme de plaintes/retours'],
  ['Autorités locales', 'Conformité et coordination territoriale', 'Moyen', 'Moyen', 'Courriers officiels, réunions ponctuelles'],
]

export async function genererPlanPartiesPrenantes({ client, fiche, partiesPrenantes }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Parties prenantes')

  const widths = [26, 34, 14, 14, 40]
  widths.forEach((w, i) => (ws.getColumn(i + 1).width = w))

  ws.mergeCells('A1:E1')
  ws.getCell('A1').value = `PLAN DE GESTION DES PARTIES PRENANTES — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:E2')
  ws.getCell('A2').value = fiche?.nom_projet ? `Projet : ${fiche.nom_projet}` : ''
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  const headerRow = 4
  ;['Partie prenante', 'Intérêt / enjeu', 'Niveau d\u2019influence', 'Niveau d\u2019intérêt', 'Stratégie de communication'].forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { wrapText: true, vertical: 'middle' }
  })

  const donnees = partiesPrenantes && partiesPrenantes.length > 0
    ? partiesPrenantes.map((pp) => [pp.nom, pp.enjeu, pp.influence, pp.interet, pp.strategie_communication])
    : EXEMPLES

  donnees.forEach((ex, i) => {
    const r = headerRow + 1 + i
    ex.forEach((val, ci) => {
      ws.getCell(r, ci + 1).value = val
    })
  })

  if (!partiesPrenantes || partiesPrenantes.length === 0) {
    const noteRow = headerRow + 1 + donnees.length + 1
    ws.mergeCells(`A${noteRow}:E${noteRow}`)
    ws.getCell(noteRow, 1).value = "Exemples génériques — aucune partie prenante n'a encore été saisie pour ce projet."
    ws.getCell(noteRow, 1).font = { italic: true, size: 9, color: { argb: 'FFC0392B' } }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Plan_parties_prenantes_${(client?.nom || 'projet').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
