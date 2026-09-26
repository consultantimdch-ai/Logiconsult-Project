// src/lib/genererFicheDePoste.js
//
// Génère un modèle vierge de fiche de poste, à dupliquer pour chaque fonction clé.
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
    children: [new TextRun({ text, bold: true, color: NAVY, size: 26 })],
  })
}
function champ(label) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [
      new TextRun({ text: label + ' : ', bold: true, size: 21 }),
      new TextRun({ text: '________________________________________', size: 21 }),
    ],
  })
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } })
}

export async function genererFicheDePoste({ client }) {
  const nomClient = client?.nom || "l'organisation"

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'FICHE DE POSTE', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('Identification du poste'),
        champ('Intitulé du poste'),
        champ('Direction / Service de rattachement'),
        champ('Supérieur hiérarchique direct'),
        champ('Date de création / révision de la fiche'),

        h1('Mission principale'),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '________________________________________________________________', size: 21 })] }),

        h1('Activités principales'),
        bullet('_______________________________________________'),
        bullet('_______________________________________________'),
        bullet('_______________________________________________'),
        bullet('_______________________________________________'),

        h1('Compétences et qualifications requises'),
        champ('Diplôme / niveau d\u2019études'),
        champ('Expérience professionnelle requise'),
        champ('Compétences techniques'),
        champ('Compétences comportementales (savoir-être)'),

        h1('Conditions d\u2019exercice'),
        champ('Type de contrat'),
        champ('Lieu d\u2019affectation'),
        champ('Déplacements éventuels'),

        h1('Validation'),
        champ('Élaboré par'),
        champ('Validé par'),
        champ('Date'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Fiche_de_poste_modele_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
