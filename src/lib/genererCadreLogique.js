// src/lib/genererCadreLogique.js
//
// Génère le cadre logique (matrice logique) du projet, pré-rempli avec
// les objectifs de la fiche projet. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'
const LIGHTGOLD = 'FFF3ECDD'

export async function genererCadreLogique({ client, fiche, indicateurs }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Cadre logique')

  ws.getColumn(1).width = 22
  ws.getColumn(2).width = 40
  ws.getColumn(3).width = 30
  ws.getColumn(4).width = 30
  ws.getColumn(5).width = 30

  ws.mergeCells('A1:E1')
  ws.getCell('A1').value = `CADRE LOGIQUE — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:E2')
  ws.getCell('A2').value = fiche?.nom_projet ? `Projet : ${fiche.nom_projet}` : ''
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  const headerRow = 4
  ;['Logique d\u2019intervention', 'Indicateurs objectivement vérifiables', 'Sources de vérification', 'Hypothèses', 'Résultats attendus (détail)'].forEach((h, i) => {
    const cell = ws.getCell(headerRow, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { wrapText: true, vertical: 'middle' }
  })

  const niveaux = [
    { label: 'Objectif global', valeur: fiche?.objectif_global },
    { label: 'Objectifs spécifiques', valeur: fiche?.objectifs_specifiques },
    { label: 'Résultats attendus', valeur: '' },
    { label: 'Activités principales', valeur: '' },
  ]

  niveaux.forEach((n, i) => {
    const r = headerRow + 1 + i
    ws.getCell(r, 1).value = n.label
    ws.getCell(r, 1).font = { bold: true, color: { argb: NAVY } }
    ws.getCell(r, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHTGOLD } }
    ws.getCell(r, 2).value = n.valeur || ''
    ws.getCell(r, 3).value = ''
    ws.getCell(r, 4).value = ''
    ws.getCell(r, 5).value = ''
  })

  // Ligne d'indicateurs déjà saisis, en annexe sous le tableau
  const indRow = headerRow + niveaux.length + 3
  ws.getCell(indRow, 1).value = 'Indicateurs déjà saisis dans la mission (pour référence) :'
  ws.getCell(indRow, 1).font = { bold: true, size: 10 }
  ;(indicateurs || []).forEach((ind, i) => {
    const r = indRow + 1 + i
    ws.getCell(r, 1).value = ind.resultat_axe || ''
    ws.getCell(r, 2).value = ind.indicateur || ''
    ws.getCell(r, 3).value = ind.source_verification || ''
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Cadre_logique_${(client?.nom || 'projet').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
