// src/lib/genererPlanStrategique.js
//
// Génère le plan stratégique (Word), à partir de la fiche stratégique saisie.
// À coller dans src/lib/.

import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx'
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

export async function genererPlanStrategique({ client, fiche }) {
  const nomClient = client?.nom || "l'organisation"

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'PLAN STRATÉGIQUE', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('1. Vision'),
        p(fiche?.vision || '[À compléter]'),

        h1('2. Mission'),
        p(fiche?.mission_texte || '[À compléter]'),

        h1('3. Valeurs'),
        p(fiche?.valeurs || '[À compléter]'),

        h1('4. Objectifs stratégiques (3-5 ans)'),
        p(fiche?.objectifs_strategiques || '[À compléter]'),

        h1('5. Axes stratégiques'),
        p(fiche?.axes_strategiques || '[À compléter]'),

        h1('6. Diagnostic stratégique'),
        p(fiche?.derniere_analyse_swot
          ? `Dernière analyse SWOT réalisée le ${new Date(fiche.derniere_analyse_swot).toLocaleDateString('fr-FR')} — voir la matrice SWOT jointe.`
          : "Aucune analyse SWOT enregistrée à ce jour — voir le document 'Matrice SWOT' à compléter séparément."),

        h1('7. Suivi et revue'),
        p(fiche?.prochaine_revue_strategique
          ? `Prochaine revue stratégique prévue le ${new Date(fiche.prochaine_revue_strategique).toLocaleDateString('fr-FR')}.`
          : 'Aucune date de revue stratégique programmée — il est recommandé de fixer une revue au minimum annuelle.'),
        p('Le suivi de la mise en œuvre de ce plan s\u2019appuie sur le tableau de bord stratégique associé.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Plan_strategique_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
