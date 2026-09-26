// src/lib/genererModeleBudget.js
//
// Génère un modèle de budget annuel (canevas vierge structuré Produits/Charges),
// prêt à être complété chaque exercice. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const GOLD = 'FFB08D3E'
const WHITE = 'FFFFFFFF'
const LIGHTGOLD = 'FFF3ECDD'

const LIGNES_PRODUITS = [
  'Subventions / financements bailleurs',
  'Ressources propres / cotisations',
  'Prestations de services',
  'Autres produits',
]

const LIGNES_CHARGES = [
  'Charges de personnel',
  'Achats et fournitures',
  'Transport et déplacements',
  'Services extérieurs (loyers, entretien, assurances)',
  'Honoraires et prestations externes',
  'Communication et frais de mission',
  'Impôts et taxes',
  'Frais financiers',
  'Autres charges',
]

function sectionHeader(ws, row, label) {
  ws.mergeCells(`A${row}:D${row}`)
  const cell = ws.getCell(`A${row}`)
  cell.value = label
  cell.font = { bold: true, color: { argb: WHITE }, size: 11 }
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
}

function ligneHeader(ws, row) {
  ;['Ligne budgétaire', 'Montant annuel (FCFA)', 'Répartition mensuelle (FCFA/mois)', 'Observations'].forEach((h, i) => {
    const cell = ws.getCell(row, i + 1)
    cell.value = h
    cell.font = { bold: true, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHTGOLD } }
  })
}

export async function genererModeleBudget({ client, fiche, exercice }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Budget annuel')

  ws.getColumn(1).width = 40
  ws.getColumn(2).width = 20
  ws.getColumn(3).width = 24
  ws.getColumn(4).width = 30

  ws.mergeCells('A1:D1')
  ws.getCell('A1').value = `MODÈLE DE BUDGET ANNUEL — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }
  ws.mergeCells('A2:D2')
  ws.getCell('A2').value = `Exercice : ${exercice || '____'}`
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  let row = 4
  sectionHeader(ws, row, 'PRODUITS / RECETTES')
  row++
  ligneHeader(ws, row)
  row++
  const firstProduitRow = row
  LIGNES_PRODUITS.forEach((lib) => {
    ws.getCell(row, 1).value = lib
    ws.getCell(row, 2).value = null
    ws.getCell(row, 3).value = { formula: `IFERROR(B${row}/12,"")` }
    row++
  })
  const lastProduitRow = row - 1
  ws.getCell(row, 1).value = 'TOTAL PRODUITS'
  ws.getCell(row, 1).font = { bold: true }
  ws.getCell(row, 2).value = { formula: `SUM(B${firstProduitRow}:B${lastProduitRow})` }
  ws.getCell(row, 2).font = { bold: true, color: { argb: NAVY } }
  const totalProduitsRow = row
  row += 2

  sectionHeader(ws, row, 'CHARGES / DÉPENSES')
  row++
  ligneHeader(ws, row)
  row++
  const firstChargeRow = row
  LIGNES_CHARGES.forEach((lib) => {
    ws.getCell(row, 1).value = lib
    ws.getCell(row, 2).value = null
    ws.getCell(row, 3).value = { formula: `IFERROR(B${row}/12,"")` }
    row++
  })
  const lastChargeRow = row - 1
  ws.getCell(row, 1).value = 'TOTAL CHARGES'
  ws.getCell(row, 1).font = { bold: true }
  ws.getCell(row, 2).value = { formula: `SUM(B${firstChargeRow}:B${lastChargeRow})` }
  ws.getCell(row, 2).font = { bold: true, color: { argb: NAVY } }
  const totalChargesRow = row
  row += 2

  ws.getCell(row, 1).value = 'SOLDE PRÉVISIONNEL (Produits - Charges)'
  ws.getCell(row, 1).font = { bold: true, color: { argb: GOLD } }
  ws.getCell(row, 2).value = { formula: `B${totalProduitsRow}-B${totalChargesRow}` }
  ws.getCell(row, 2).font = { bold: true, color: { argb: GOLD }, size: 12 }
  ;[1, 2].forEach((col) => {
    ws.getCell(row, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3ECDD' } }
  })

  ;[2, 3].forEach((col) => {
    ws.getColumn(col).numFmt = '#,##0'
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Modele_budget_${(client?.nom || 'organisation').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
