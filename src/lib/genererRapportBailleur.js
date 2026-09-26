// src/lib/genererRapportBailleur.js
//
// Génère un modèle de rapport financier destiné aux bailleurs/partenaires,
// pré-rempli avec les données de budget disponibles pour la mission.
// À coller dans src/lib/.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

const NAVY = '1B2A4A'
const GOLD = 'B08D3E'

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    border: { bottom: { color: GOLD, space: 4, style: BorderStyle.SINGLE, size: 8 } },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 28 })],
  })
}
function p(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 21 })] })
}
function cell(text, header = false) {
  return new TableCell({
    shading: header ? { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: header, color: header ? 'FFFFFF' : '000000', size: 19 })] })],
  })
}

export async function genererRapportBailleur({ client, mission, fiche, budget }) {
  const nomClient = client?.nom || "l'organisation"
  const bailleur = fiche?.bailleur || '[Nom du bailleur]'
  const periode = mission?.date_mission ? new Date(mission.date_mission).toLocaleDateString('fr-FR') : '[période]'

  const rows = [new TableRow({ children: [cell('Ligne budgétaire', true), cell('Budget prévu (FCFA)', true), cell('Dépensé à date (FCFA)', true), cell('Solde (FCFA)', true)] })]
  let totalPrevu = 0
  let totalDepense = 0
  ;(budget || []).forEach((b) => {
    const prevu = Number(b.budget_prevu) || 0
    const depense = Number(b.depense_a_date) || 0
    totalPrevu += prevu
    totalDepense += depense
    rows.push(new TableRow({
      children: [cell(b.ligne || ''), cell(prevu.toLocaleString('fr-FR')), cell(depense.toLocaleString('fr-FR')), cell((prevu - depense).toLocaleString('fr-FR'))],
    }))
  })
  if ((budget || []).length === 0) {
    rows.push(new TableRow({ children: [cell('Aucune ligne budgétaire renseignée'), cell('-'), cell('-'), cell('-')] }))
  } else {
    rows.push(new TableRow({
      children: [cell('TOTAL', true), cell(totalPrevu.toLocaleString('fr-FR'), true), cell(totalDepense.toLocaleString('fr-FR'), true), cell((totalPrevu - totalDepense).toLocaleString('fr-FR'), true)],
    }))
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'RAPPORT FINANCIER PÉRIODIQUE', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: `À l'attention de : ${bailleur}`, italics: true, size: 20 })] }),

        h1('1. Résumé exécutif'),
        p(`Le présent rapport présente l'état d'avancement financier de ${nomClient} pour la période arrêtée au ${periode}. [À compléter : synthèse en 2-3 phrases du niveau d'exécution global et des points d'attention.]`),

        h1('2. Exécution budgétaire par ligne'),
        new Table({ width: { size: 9500, type: WidthType.DXA }, rows }),

        h1('3. Commentaires et justification des écarts'),
        p('[À compléter : expliquer les écarts significatifs entre budget prévu et dépenses réalisées, ligne par ligne si nécessaire.]'),

        h1('4. Perspectives pour la période suivante'),
        p('[À compléter : prévisions de dépenses, besoins de trésorerie anticipés, ajustements budgétaires envisagés.]'),

        h1('5. Pièces jointes'),
        p('[Lister ici les pièces justificatives, relevés bancaires ou annexes jointes au rapport.]'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Rapport_bailleur_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
