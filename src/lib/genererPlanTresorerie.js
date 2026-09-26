// src/lib/genererPlanTresorerie.js
//
// Génère un plan de trésorerie prévisionnel sur 12 mois (canevas vierge),
// avec solde mensuel et cumulé calculés automatiquement. À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const GOLD = 'FFB08D3E'
const WHITE = 'FFFFFFFF'
const LIGHTGOLD = 'FFF3ECDD'

const MOIS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

const LIGNES_ENTREES = ['Encaissements bailleurs/clients', 'Ressources propres', 'Autres entrées']
const LIGNES_SORTIES = ['Salaires et charges sociales', 'Achats et fournitures', 'Loyers et charges fixes', 'Autres décaissements']

export async function genererPlanTresorerie({ client, soldeInitial }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Trésorerie')

  ws.getColumn(1).width = 32
  for (let i = 0; i < 12; i++) ws.getColumn(2 + i).width = 11

  ws.mergeCells('A1:M1')
  ws.getCell('A1').value = `PLAN DE TRÉSORERIE PRÉVISIONNEL — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }

  const headerRow = 3
  ws.getCell(headerRow, 1).value = ''
  MOIS.forEach((m, i) => {
    const cell = ws.getCell(headerRow, 2 + i)
    cell.value = m
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { horizontal: 'center' }
  })

  let row = headerRow + 2
  ws.getCell(row, 1).value = 'Solde initial'
  ws.getCell(row, 1).font = { bold: true }
  ws.getCell(row, 2).value = soldeInitial || 0
  const soldeInitialRow = row
  row += 2

  ws.getCell(row, 1).value = 'ENTRÉES DE TRÉSORERIE'
  ws.getCell(row, 1).font = { bold: true, color: { argb: WHITE } }
  ws.mergeCells(row, 1, row, 13)
  ws.getCell(row, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  row++
  const firstEntreeRow = row
  LIGNES_ENTREES.forEach((lib) => {
    ws.getCell(row, 1).value = lib
    row++
  })
  const lastEntreeRow = row - 1
  ws.getCell(row, 1).value = 'Total entrées'
  ws.getCell(row, 1).font = { bold: true }
  for (let m = 0; m < 12; m++) {
    const col = 2 + m
    ws.getCell(row, col).value = { formula: `SUM(${ws.getCell(firstEntreeRow, col).address}:${ws.getCell(lastEntreeRow, col).address})` }
    ws.getCell(row, col).font = { bold: true }
  }
  const totalEntreesRow = row
  row += 2

  ws.getCell(row, 1).value = 'SORTIES DE TRÉSORERIE'
  ws.getCell(row, 1).font = { bold: true, color: { argb: WHITE } }
  ws.mergeCells(row, 1, row, 13)
  ws.getCell(row, 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  row++
  const firstSortieRow = row
  LIGNES_SORTIES.forEach((lib) => {
    ws.getCell(row, 1).value = lib
    row++
  })
  const lastSortieRow = row - 1
  ws.getCell(row, 1).value = 'Total sorties'
  ws.getCell(row, 1).font = { bold: true }
  for (let m = 0; m < 12; m++) {
    const col = 2 + m
    ws.getCell(row, col).value = { formula: `SUM(${ws.getCell(firstSortieRow, col).address}:${ws.getCell(lastSortieRow, col).address})` }
    ws.getCell(row, col).font = { bold: true }
  }
  const totalSortiesRow = row
  row += 2

  ws.getCell(row, 1).value = 'Solde du mois (Entrées - Sorties)'
  ws.getCell(row, 1).font = { bold: true, color: { argb: GOLD } }
  for (let m = 0; m < 12; m++) {
    const col = 2 + m
    ws.getCell(row, col).value = {
      formula: `${ws.getCell(totalEntreesRow, col).address}-${ws.getCell(totalSortiesRow, col).address}`,
    }
    ws.getCell(row, col).font = { bold: true, color: { argb: GOLD } }
  }
  const soldeMoisRow = row
  row++

  ws.getCell(row, 1).value = 'Solde cumulé de trésorerie'
  ws.getCell(row, 1).font = { bold: true }
  for (let m = 0; m < 12; m++) {
    const col = 2 + m
    const prevCumulAddr = m === 0 ? `B${soldeInitialRow}` : ws.getCell(row, col - 1).address
    ws.getCell(row, col).value = {
      formula: `${prevCumulAddr}+${ws.getCell(soldeMoisRow, col).address}`,
    }
    ws.getCell(row, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHTGOLD } }
  }

  for (let r = soldeInitialRow; r <= row; r++) {
    for (let c = 2; c <= 13; c++) {
      ws.getCell(r, c).numFmt = '#,##0'
    }
  }

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Plan_tresorerie_${(client?.nom || 'organisation').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
