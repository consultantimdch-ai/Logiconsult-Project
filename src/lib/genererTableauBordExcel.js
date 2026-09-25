// src/lib/genererTableauBordExcel.js
//
// Génère le tableau de bord de suivi de projet en Excel (.xlsx), rempli avec
// les données réelles de la mission (fiche projet, indicateurs, jalons, budget).
// À coller dans src/lib/.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const GOLD = 'FFB08D3E'
const LIGHTGOLD = 'FFF3ECDD'
const WHITE = 'FFFFFFFF'

function headerRow(ws, rowIdx, headers) {
  const row = ws.getRow(rowIdx)
  headers.forEach((h, i) => {
    const cell = row.getCell(i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
  })
  row.commit()
}

export async function genererTableauBordExcel({ mission, client, fiche, indicateurs, jalons, budget }) {
  const wb = new ExcelJS.Workbook()

  // ---------------- Garde ----------------
  const garde = wb.addWorksheet('Garde')
  garde.getColumn(2).width = 60
  garde.getCell('B3').value = 'TABLEAU DE BORD DE SUIVI DE PROJET'
  garde.getCell('B3').font = { bold: true, size: 16, color: { argb: NAVY } }
  garde.getCell('B5').value = 'Imadou-Dini IMOROU'
  garde.getCell('B5').font = { bold: true, size: 12, color: { argb: GOLD } }
  garde.getCell('B6').value = 'Consultant en Management Organisationnel & SERA/MEAL'
  garde.getCell('B6').font = { italic: true, size: 10, color: { argb: NAVY } }
  garde.getCell('B8').value = `Client : ${client?.nom || ''}`
  garde.getCell('B9').value = `Mission du : ${mission?.date_mission ? new Date(mission.date_mission).toLocaleDateString('fr-FR') : ''}`

  // ---------------- Fiche Projet ----------------
  const wsFiche = wb.addWorksheet('Fiche Projet')
  wsFiche.getColumn(1).width = 28
  wsFiche.getColumn(2).width = 55
  wsFiche.getCell('A1').value = "FICHE D'IDENTIFICATION DU PROJET"
  wsFiche.getCell('A1').font = { bold: true, size: 13, color: { argb: NAVY } }
  const champs = [
    ['Nom du projet', fiche?.nom_projet],
    ['Bailleur / financement', fiche?.bailleur],
    ['Chef de projet', fiche?.chef_projet],
    ['Date de début', fiche?.date_debut],
    ['Date de fin prévue', fiche?.date_fin_prevue],
    ['Objectif global', fiche?.objectif_global],
    ['Objectifs spécifiques', fiche?.objectifs_specifiques],
    ["Zone d'intervention", fiche?.zone_intervention],
  ]
  champs.forEach(([label, val], i) => {
    const r = 3 + i
    wsFiche.getCell(`A${r}`).value = label
    wsFiche.getCell(`A${r}`).font = { bold: true, size: 10 }
    wsFiche.getCell(`B${r}`).value = val || ''
    wsFiche.getCell(`B${r}`).font = { color: { argb: 'FF0000FF' }, size: 10 }
  })

  // ---------------- Indicateurs ----------------
  const wsInd = wb.addWorksheet('Indicateurs')
  const colsInd = ['Résultat/Axe', 'Indicateur', 'Unité', 'Cible', 'Valeur actuelle', '% Réalisation', 'Statut', 'Source', 'Fréquence', 'Responsable']
  const widthsInd = [16, 32, 10, 10, 14, 12, 12, 22, 12, 16]
  widthsInd.forEach((w, i) => (wsInd.getColumn(i + 1).width = w))
  headerRow(wsInd, 1, colsInd)

  ;(indicateurs || []).forEach((ind, i) => {
    const r = 2 + i
    wsInd.getCell(`A${r}`).value = ind.resultat_axe || ''
    wsInd.getCell(`B${r}`).value = ind.indicateur || ''
    wsInd.getCell(`C${r}`).value = ind.unite || ''
    wsInd.getCell(`D${r}`).value = ind.cible || null
    wsInd.getCell(`E${r}`).value = ind.valeur_actuelle || null
    wsInd.getCell(`F${r}`).value = { formula: `IFERROR(E${r}/D${r},"")` }
    wsInd.getCell(`F${r}`).numFmt = '0%'
    wsInd.getCell(`G${r}`).value = {
      formula: `IF(F${r}="","",IF(F${r}>=0.9,"Atteint",IF(F${r}>=0.5,"En cours","À risque")))`,
    }
    wsInd.getCell(`H${r}`).value = ind.source_verification || ''
    wsInd.getCell(`I${r}`).value = ind.frequence || ''
    wsInd.getCell(`J${r}`).value = ind.responsable || ''
  })

  // ---------------- Jalons ----------------
  const wsJal = wb.addWorksheet('Jalons')
  const colsJal = ['Jalon / Livrable', 'Date prévue', 'Date réelle', '% Avancement', 'Commentaire']
  const widthsJal = [32, 14, 14, 14, 30]
  widthsJal.forEach((w, i) => (wsJal.getColumn(i + 1).width = w))
  headerRow(wsJal, 1, colsJal)

  ;(jalons || []).forEach((j, i) => {
    const r = 2 + i
    wsJal.getCell(`A${r}`).value = j.libelle || ''
    wsJal.getCell(`B${r}`).value = j.date_prevue || ''
    wsJal.getCell(`C${r}`).value = j.date_reelle || ''
    wsJal.getCell(`D${r}`).value = j.avancement ? Number(j.avancement) / 100 : null
    wsJal.getCell(`D${r}`).numFmt = '0%'
    wsJal.getCell(`E${r}`).value = j.commentaire || ''
  })

  // ---------------- Budget ----------------
  const wsBud = wb.addWorksheet('Budget')
  const colsBud = ['Ligne budgétaire', 'Budget prévu (FCFA)', 'Dépensé à date (FCFA)', 'Solde (FCFA)', '% Consommé']
  const widthsBud = [28, 18, 18, 16, 12]
  widthsBud.forEach((w, i) => (wsBud.getColumn(i + 1).width = w))
  headerRow(wsBud, 1, colsBud)

  ;(budget || []).forEach((b, i) => {
    const r = 2 + i
    wsBud.getCell(`A${r}`).value = b.ligne || ''
    wsBud.getCell(`B${r}`).value = b.budget_prevu || null
    wsBud.getCell(`C${r}`).value = b.depense_a_date || null
    wsBud.getCell(`D${r}`).value = { formula: `IFERROR(B${r}-C${r},"")` }
    wsBud.getCell(`E${r}`).value = { formula: `IFERROR(C${r}/B${r},"")` }
    wsBud.getCell(`E${r}`).numFmt = '0%'
  })
  const lastBudgetRow = 1 + (budget?.length || 0)
  if (lastBudgetRow >= 2) {
    const totRow = lastBudgetRow + 2
    wsBud.getCell(`A${totRow}`).value = 'TOTAL'
    wsBud.getCell(`A${totRow}`).font = { bold: true }
    wsBud.getCell(`B${totRow}`).value = { formula: `SUM(B2:B${lastBudgetRow})` }
    wsBud.getCell(`C${totRow}`).value = { formula: `SUM(C2:C${lastBudgetRow})` }
    wsBud.getCell(`D${totRow}`).value = { formula: `B${totRow}-C${totRow}` }
    wsBud.getCell(`E${totRow}`).value = { formula: `IFERROR(C${totRow}/B${totRow},"")` }
    wsBud.getCell(`E${totRow}`).numFmt = '0%'
    ;['A', 'B', 'C', 'D', 'E'].forEach((col) => {
      wsBud.getCell(`${col}${totRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHTGOLD } }
    })
  }

  // ---------------- Téléchargement ----------------
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const nomFichier = `Tableau_de_bord_${(client?.nom || 'projet').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`
  saveAs(blob, nomFichier)
}
