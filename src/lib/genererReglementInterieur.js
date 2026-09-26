// src/lib/genererReglementInterieur.js
//
// Génère un règlement intérieur type, inspiré des dispositions usuelles
// du droit du travail béninois. À faire valider par un juriste avant diffusion.
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

export async function genererReglementInterieur({ client }) {
  const nomClient = client?.nom || "l'organisation"

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'RÈGLEMENT INTÉRIEUR', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: '⚠ Modèle de base à faire valider par un juriste ou un conseil en droit du travail avant adoption et dépôt auprès de l\u2019inspection du travail.', italics: true, size: 18, color: 'C0392B' })] }),

        h1('Article 1 — Champ d\u2019application'),
        p(`Le présent règlement intérieur s'applique à l'ensemble du personnel de ${nomClient}, quel que soit le type de contrat de travail.`),

        h1('Article 2 — Horaires de travail'),
        p('Les horaires de travail sont fixés par la direction et communiqués à l\u2019ensemble du personnel. Toute modification est notifiée par écrit avec un préavis raisonnable.'),

        h1('Article 3 — Absences et congés'),
        p('Toute absence doit être justifiée dans les meilleurs délais auprès du responsable hiérarchique. Les congés sont planifiés en accord avec la direction, en tenant compte des nécessités de service.'),

        h1('Article 4 — Discipline générale'),
        p('Chaque employé est tenu de respecter les consignes de travail, les horaires, ainsi que les règles de courtoisie et de respect mutuel envers ses collègues et sa hiérarchie.'),

        h1('Article 5 — Hygiène et sécurité'),
        p('L\u2019organisation veille à la mise à disposition d\u2019un cadre de travail sain et sécurisé. Chaque employé est tenu de respecter les consignes de sécurité en vigueur.'),

        h1('Article 6 — Procédure disciplinaire'),
        p('En cas de manquement aux règles du présent règlement, les sanctions suivantes peuvent être appliquées, de manière proportionnée et graduée : avertissement verbal, avertissement écrit, mise à pied, licenciement pour faute grave. Toute sanction est précédée d\u2019un entretien contradictoire.'),

        h1('Article 7 — Harcèlement et discrimination'),
        p('Toute forme de harcèlement moral, sexuel, ou de discrimination est strictement interdite. Un mécanisme de signalement confidentiel est mis à disposition du personnel.'),

        h1('Article 8 — Confidentialité'),
        p('Les employés sont tenus à une obligation de confidentialité concernant les informations sensibles de l\u2019organisation et de ses bénéficiaires/partenaires, pendant et après la relation de travail.'),

        h1('Article 9 — Dispositions diverses'),
        p('Le présent règlement est porté à la connaissance de chaque employé lors de son intégration et affiché dans les locaux de l\u2019organisation. Il peut être modifié par la direction, après consultation des représentants du personnel s\u2019ils existent.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Reglement_interieur_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
