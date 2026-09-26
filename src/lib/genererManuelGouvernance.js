// src/lib/genererManuelGouvernance.js
//
// Génère le manuel de gouvernance (rôles des instances, fréquence de réunion).
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

export async function genererManuelGouvernance({ client, fiche }) {
  const nomClient = client?.nom || "l'organisation"
  const structureActuelle = fiche?.structure_gouvernance

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'MANUEL DE GOUVERNANCE', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('1. Objet'),
        p(`Le présent manuel décrit le fonctionnement des instances de gouvernance de ${nomClient}, leurs rôles respectifs et leurs modalités de fonctionnement.`),

        ...(structureActuelle
          ? [h1('2. Structure de gouvernance actuelle (déclarée lors de l\u2019audit)'), p(structureActuelle)]
          : []),

        h1(structureActuelle ? '3. Assemblée générale' : '2. Assemblée générale'),
        p('L\u2019Assemblée générale est l\u2019instance souveraine de l\u2019organisation. Elle se réunit au minimum une fois par an en session ordinaire, pour approuver les comptes, le rapport d\u2019activités, et orienter la stratégie générale.'),

        h1(structureActuelle ? '4. Conseil d\u2019administration / Bureau exécutif' : '3. Conseil d\u2019administration / Bureau exécutif'),
        p('Le Conseil d\u2019administration (ou Bureau exécutif) assure le pilotage stratégique entre deux Assemblées générales. Il se réunit au minimum une fois par trimestre. Il valide le budget annuel, les grandes orientations, et contrôle l\u2019action de la direction exécutive.'),

        h1(structureActuelle ? '5. Direction exécutive' : '4. Direction exécutive'),
        p('La direction exécutive assure la gestion quotidienne de l\u2019organisation, dans le respect des orientations fixées par les instances de gouvernance. Elle rend compte régulièrement au Conseil d\u2019administration.'),

        h1(structureActuelle ? '6. Délégation de pouvoir' : '5. Délégation de pouvoir'),
        p('Les délégations de pouvoir entre instances de gouvernance et direction exécutive sont formalisées par écrit, avec un périmètre et des limites clairement définis (voir la Grille de délégation de signature).'),

        h1(structureActuelle ? '7. Révision' : '6. Révision'),
        p('Le présent manuel est révisé à chaque évolution statutaire ou organisationnelle significative.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Manuel_gouvernance_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
