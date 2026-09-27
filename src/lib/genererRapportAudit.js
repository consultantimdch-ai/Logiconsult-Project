// src/lib/genererRapportAudit.js
//
// Génère le rapport d'audit complet (Word) : synthèse des scores, points
// critiques, recommandations avec statut, et comparaison avec la mission
// précédente le cas échéant. À coller dans src/lib/.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

const NAVY = '1B2A4A'
const GOLD = 'B08D3E'
const RED = 'C0392B'
const GREEN = '2E7D32'

const DOMAINE_LABELS = {
  projet: 'Gestion de projet',
  financier: 'Gestion financière',
  organisationnel: 'Gestion organisationnelle',
}
const STATUT_LABELS = {
  non_entamee: 'Non entamée',
  en_cours: 'En cours',
  realisee: 'Réalisée',
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 150 },
    border: { bottom: { color: GOLD, space: 4, style: BorderStyle.SINGLE, size: 8 } },
    children: [new TextRun({ text, bold: true, color: NAVY, size: 28 })],
  })
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 21, bold: !!opts.bold, color: opts.color })] })
}
function cell(text, opts = {}) {
  return new TableCell({
    shading: opts.header ? { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: opts.header || opts.bold, color: opts.header ? 'FFFFFF' : (opts.color || '000000'), size: 19 })] })],
  })
}

function moyenne(notes) {
  const valides = notes.filter((n) => n !== null && n !== undefined && n !== '')
  if (valides.length === 0) return null
  return valides.reduce((a, b) => a + Number(b), 0) / valides.length
}

export async function genererRapportAudit({ client, mission, criteres, scores, recommandations, missionPrecedente, scoresPrecedents }) {
  const nomClient = client?.nom || "l'organisation"
  const dateMission = mission?.date_mission ? new Date(mission.date_mission).toLocaleDateString('fr-FR') : ''

  // ---- Synthèse par domaine ----
  const tableDomaines = [new TableRow({ children: [cell('Domaine', { header: true }), cell('Score moyen /5', { header: true })] })]
  mission.domaines.forEach((d) => {
    const critsDom = criteres.filter((c) => c.domaine === d)
    const notes = critsDom.map((c) => scores[c.id]?.score)
    const moy = moyenne(notes)
    tableDomaines.push(new TableRow({ children: [cell(DOMAINE_LABELS[d] || d), cell(moy !== null ? moy.toFixed(1) : '—')] }))
  })

  // ---- Détail par axe ----
  const axes = [...new Set(criteres.map((c) => c.axe))]
  const tableAxes = [new TableRow({ children: [cell('Domaine', { header: true }), cell('Axe', { header: true }), cell('Score moyen /5', { header: true })] })]
  axes.forEach((axe) => {
    const critsAxe = criteres.filter((c) => c.axe === axe)
    const notes = critsAxe.map((c) => scores[c.id]?.score)
    const moy = moyenne(notes)
    tableAxes.push(new TableRow({ children: [cell(DOMAINE_LABELS[critsAxe[0]?.domaine] || ''), cell(axe), cell(moy !== null ? moy.toFixed(1) : '—')] }))
  })

  // ---- Points critiques ----
  const pointsCritiques = criteres
    .map((c) => ({ ...c, score: scores[c.id]?.score, commentaire: scores[c.id]?.commentaire }))
    .filter((c) => c.score !== '' && c.score !== undefined && c.score !== null && Number(c.score) <= 2)

  const paragraphesPoints = pointsCritiques.length === 0
    ? [p('Aucun point critique identifié lors de cet audit.', { italics: true })]
    : pointsCritiques.map((c) => p(`• (${c.score}/5) ${c.libelle}${c.commentaire ? ' — ' + c.commentaire : ''}`, { color: RED }))

  // ---- Recommandations ----
  const tableRecos = [new TableRow({ children: [cell('Recommandation', { header: true }), cell('Statut', { header: true })] })]
  ;(recommandations || []).forEach((r) => {
    tableRecos.push(new TableRow({ children: [cell(r.texte), cell(STATUT_LABELS[r.statut] || r.statut)] }))
  })
  if (!recommandations || recommandations.length === 0) {
    tableRecos.push(new TableRow({ children: [cell('Aucune recommandation enregistrée.'), cell('—')] }))
  }

  // ---- Comparaison mission précédente ----
  let sectionComparaison = []
  if (missionPrecedente) {
    const domainesCommuns = mission.domaines.filter((d) => missionPrecedente.domaines?.includes(d))
    const tableComp = [new TableRow({ children: [cell('Domaine', { header: true }), cell('Avant', { header: true }), cell('Après', { header: true }), cell('Évolution', { header: true })] })]
    domainesCommuns.forEach((d) => {
      const notesAvant = (scoresPrecedents || []).filter((s) => s.criteres_audit?.domaine === d).map((s) => s.score)
      const moyAvant = moyenne(notesAvant)
      const critsDom = criteres.filter((c) => c.domaine === d)
      const moyApres = moyenne(critsDom.map((c) => scores[c.id]?.score))
      const delta = moyAvant !== null && moyApres !== null ? moyApres - moyAvant : null
      tableComp.push(new TableRow({
        children: [
          cell(DOMAINE_LABELS[d] || d),
          cell(moyAvant !== null ? moyAvant.toFixed(1) : '—'),
          cell(moyApres !== null ? moyApres.toFixed(1) : '—'),
          cell(delta !== null ? (delta >= 0 ? '+' : '') + delta.toFixed(1) : '—', { color: delta !== null ? (delta >= 0 ? GREEN : RED) : undefined }),
        ],
      }))
    })
    sectionComparaison = [
      h1('5. Évolution depuis la mission précédente'),
      p(`Mission précédente du ${new Date(missionPrecedente.date_mission).toLocaleDateString('fr-FR')}.`),
      new Table({ width: { size: 9000, type: WidthType.DXA }, rows: tableComp }),
    ]
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: "RAPPORT D'AUDIT EN GESTION", bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: `Mission du ${dateMission}`, italics: true, size: 20 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: 'Réalisé par Imadou-Dini IMOROU — Consultant en Management Organisationnel & SERA/MEAL', italics: true, size: 18 })] }),

        h1('1. Domaines audités'),
        p(mission.domaines.map((d) => DOMAINE_LABELS[d]).join(', ')),

        h1('2. Synthèse générale des scores'),
        new Table({ width: { size: 6000, type: WidthType.DXA }, rows: tableDomaines }),

        h1('3. Détail par axe'),
        new Table({ width: { size: 9000, type: WidthType.DXA }, rows: tableAxes }),

        h1('4. Points critiques (notés ≤ 2/5)'),
        ...paragraphesPoints,

        h1(missionPrecedente ? '5. Recommandations' : '5. Recommandations'),
        new Table({ width: { size: 9000, type: WidthType.DXA }, rows: tableRecos }),

        ...sectionComparaison,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Rapport_audit_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}_${dateMission.replace(/\//g, '-')}.docx`)
}
