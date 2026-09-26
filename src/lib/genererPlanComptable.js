// src/lib/genererPlanComptable.js
//
// Génère un plan comptable de base, structuré selon la nomenclature SYSCOHADA,
// à adapter/compléter selon l'activité réelle de l'organisation.
// Ce n'est PAS le plan comptable officiel complet (qui compte plusieurs centaines
// de comptes) mais un canevas de départ couvrant les classes et principales
// subdivisions, prêt à être enrichi.

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const NAVY = 'FF1B2A4A'
const WHITE = 'FFFFFFFF'
const LIGHTGOLD = 'FFF3ECDD'

const COMPTES = [
  ['1', 'COMPTES DE RESSOURCES DURABLES', ''],
  ['101', 'Capital social', ''],
  ['106', 'Réserves', ''],
  ['110', 'Report à nouveau', ''],
  ['120', 'Résultat net de l\u2019exercice', ''],
  ['131', 'Subventions d\u2019investissement', ''],
  ['16', 'Emprunts et dettes financières', ''],
  ['2', 'COMPTES D\u2019ACTIF IMMOBILISÉ', ''],
  ['21', 'Immobilisations incorporelles', ''],
  ['22', 'Terrains', ''],
  ['23', 'Bâtiments, installations techniques', ''],
  ['24', 'Matériel, mobilier et actifs biologiques', ''],
  ['245', 'Matériel de transport', ''],
  ['26', 'Titres de participation', ''],
  ['28', 'Amortissements des immobilisations', ''],
  ['3', 'COMPTES DE STOCKS', ''],
  ['31', 'Marchandises', ''],
  ['32', 'Matières premières et fournitures liées', ''],
  ['33', 'Autres approvisionnements', ''],
  ['4', 'COMPTES DE TIERS', ''],
  ['40', 'Fournisseurs et comptes rattachés', ''],
  ['41', 'Clients et comptes rattachés', ''],
  ['42', 'Personnel', ''],
  ['43', 'Organismes sociaux', ''],
  ['44', 'État et collectivités publiques', ''],
  ['45', 'Organismes internationaux / bailleurs de fonds', ''],
  ['46', 'Débiteurs et créditeurs divers', ''],
  ['47', 'Comptes transitoires ou d\u2019attente', ''],
  ['5', 'COMPTES DE TRÉSORERIE', ''],
  ['52', 'Banques', ''],
  ['53', 'Établissements financiers / Mobile Money', ''],
  ['57', 'Caisse', ''],
  ['6', 'COMPTES DE CHARGES DES ACTIVITÉS ORDINAIRES', ''],
  ['60', 'Achats et variations de stocks', ''],
  ['61', 'Transports', ''],
  ['62', 'Services extérieurs A (locations, entretien, assurances)', ''],
  ['63', 'Services extérieurs B (honoraires, publicité, missions)', ''],
  ['64', 'Impôts et taxes', ''],
  ['65', 'Autres charges', ''],
  ['66', 'Charges de personnel', ''],
  ['67', 'Frais financiers', ''],
  ['68', 'Dotations aux amortissements et provisions', ''],
  ['7', 'COMPTES DE PRODUITS DES ACTIVITÉS ORDINAIRES', ''],
  ['70', 'Ventes / prestations de services', ''],
  ['71', 'Subventions d\u2019exploitation', ''],
  ['75', 'Autres produits', ''],
  ['77', 'Revenus financiers', ''],
  ['78', 'Reprises de provisions', ''],
  ['8', 'AUTRES CHARGES ET PRODUITS (HAO)', ''],
  ['81', 'Valeurs comptables des cessions d\u2019immobilisations', ''],
  ['82', 'Produits des cessions d\u2019immobilisations', ''],
  ['84', 'Autres charges HAO', ''],
  ['85', 'Autres produits HAO', ''],
]

export async function genererPlanComptable({ client, fiche }) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Plan comptable')

  ws.getColumn(1).width = 10
  ws.getColumn(2).width = 55
  ws.getColumn(3).width = 30

  ws.mergeCells('A1:C1')
  ws.getCell('A1').value = `PLAN COMPTABLE — ${client?.nom || ''}`
  ws.getCell('A1').font = { bold: true, size: 14, color: { argb: NAVY } }

  ws.mergeCells('A2:C2')
  ws.getCell('A2').value = 'Canevas de base SYSCOHADA — à compléter selon l\u2019activité réelle'
  ws.getCell('A2').font = { italic: true, size: 10, color: { argb: 'FF666666' } }

  const headerRowIdx = 4
  ;['Code', 'Intitulé du compte', 'Notes / adaptation'].forEach((h, i) => {
    const cell = ws.getCell(headerRowIdx, i + 1)
    cell.value = h
    cell.font = { bold: true, color: { argb: WHITE }, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }
  })

  COMPTES.forEach((c, i) => {
    const r = headerRowIdx + 1 + i
    const isClasse = c[0].length === 1
    ws.getCell(r, 1).value = c[0]
    ws.getCell(r, 2).value = c[1]
    ws.getCell(r, 3).value = c[2]
    if (isClasse) {
      ;[1, 2, 3].forEach((col) => {
        ws.getCell(r, col).font = { bold: true, color: { argb: NAVY } }
        ws.getCell(r, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHTGOLD } }
      })
    }
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `Plan_comptable_${(client?.nom || 'organisation').replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`)
}
