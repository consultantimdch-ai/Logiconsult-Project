// src/lib/genererOrganigramme.js
//
// Génère un organigramme type sous forme de structure hiérarchique (Word),
// adapté à la taille de l'organisation (effectif total renseigné).
// À coller dans src/lib/.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle,
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
function niveau(texte, indent) {
  return new Paragraph({
    indent: { left: indent * 400 },
    spacing: { after: 80 },
    children: [new TextRun({ text: (indent > 0 ? '↳ ' : '') + texte, bold: indent === 0, size: 21, color: indent === 0 ? NAVY : '000000' })],
  })
}

export async function genererOrganigramme({ client, fiche }) {
  const nomClient = client?.nom || "l'organisation"
  const effectif = fiche?.effectif_total || null

  // Structure adaptée grossièrement à la taille de l'organisation
  const petite = !effectif || effectif <= 10
  const moyenne = effectif && effectif > 10 && effectif <= 30

  const structure = []
  structure.push(niveau('Assemblée générale / Conseil d\u2019administration', 0))
  structure.push(niveau('Direction exécutive / Coordination générale', 1))
  if (petite) {
    structure.push(niveau('Responsable administratif et financier', 2))
    structure.push(niveau('Chargé(e) de projet / Activités', 2))
  } else if (moyenne) {
    structure.push(niveau('Direction administrative et financière', 2))
    structure.push(niveau('Direction des programmes / Projets', 2))
    structure.push(niveau('Service communication / Suivi-évaluation', 2))
  } else {
    structure.push(niveau('Direction administrative et financière', 2))
    structure.push(niveau('Comptabilité', 3))
    structure.push(niveau('Ressources humaines', 3))
    structure.push(niveau('Direction des programmes / Projets', 2))
    structure.push(niveau('Chefs de projet', 3))
    structure.push(niveau('Suivi-évaluation (SERA/MEAL)', 3))
    structure.push(niveau('Direction communication / Partenariats', 2))
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'ORGANIGRAMME', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('Structure hiérarchique proposée'),
        p(effectif ? `Structure proposée pour un effectif d'environ ${effectif} personne(s). À ajuster selon les fonctions réellement existantes.` : "Structure de base à adapter selon l'effectif et les fonctions réelles de l'organisation."),
        ...structure,

        h1('Notes'),
        p('Cet organigramme est un modèle de départ. Il doit être validé par la direction et les instances de gouvernance, puis diffusé à l\u2019ensemble du personnel.'),
        fiche?.organigramme_existant
          ? p('Un organigramme existait déjà au moment de l\u2019audit — comparez-le à cette proposition pour identifier les écarts avant diffusion.')
          : p('Aucun organigramme formalisé n\u2019existait au moment de l\u2019audit — ce document constitue une première formalisation.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Organigramme_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
