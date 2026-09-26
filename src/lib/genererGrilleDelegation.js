// src/lib/genererGrilleDelegation.js
//
// Génère la grille de délégation de signature / d'autorisation de dépense.
// À coller dans src/lib/.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle,
} from 'docx'
import { saveAs } from 'file-saver'

const NAVY = '1B2A4A'
const GOLD = 'B08D3E'
const LIGHTGOLD = 'F3ECDD'

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

function ligneCell(text, header = false) {
  return new TableCell({
    shading: header ? { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: header, color: header ? 'FFFFFF' : '000000', size: 20 })] })],
  })
}

const NIVEAUX = [
  ['Jusqu\u2019à 50 000 FCFA', 'Chef de service / Responsable de projet'],
  ['De 50 001 à 250 000 FCFA', 'Responsable administratif et financier'],
  ['De 250 001 à 1 000 000 FCFA', 'Directeur exécutif / Coordonnateur'],
  ['Au-delà de 1 000 000 FCFA', 'Conseil d\u2019administration / Bureau exécutif'],
]

export async function genererGrilleDelegation({ client, fiche }) {
  const nomClient = client?.nom || "l'organisation"

  const table = new Table({
    width: { size: 9000, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [ligneCell('Tranche de montant', true), ligneCell('Niveau d\u2019autorisation requis', true)] }),
      ...NIVEAUX.map(([montant, niveau], i) => new TableRow({
        children: [ligneCell(montant), ligneCell(niveau)],
      })),
    ],
  })

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'GRILLE DE DÉLÉGATION DE SIGNATURE', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('1. Objet'),
        p(`La présente grille fixe les niveaux d'autorisation requis pour tout engagement de dépense au sein de ${nomClient}, en fonction du montant concerné. Elle vise à sécuriser les circuits de décision financière et à prévenir les engagements non autorisés.`),

        h1('2. Grille des seuils'),
        table,

        new Paragraph({ spacing: { before: 300, after: 120 }, children: [new TextRun({ text: fiche?.seuils_autorisation
          ? `Note : seuils personnalisés indiqués lors de l'audit : ${fiche.seuils_autorisation}`
          : "Les seuils ci-dessus sont indicatifs — à ajuster selon la taille et les pratiques réelles de l'organisation.", italics: true, size: 18 })] }),

        h1('3. Règles complémentaires'),
        p('Toute délégation de signature doit être formalisée par écrit et signée par la personne délégante et le délégataire.'),
        p('En cas d\u2019absence prolongée du responsable habituel, une délégation temporaire doit être établie et communiquée aux services concernés.'),
        p('Aucun engagement de dépense ne peut être validé rétroactivement sans justification écrite approuvée par le niveau supérieur.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Grille_delegation_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
