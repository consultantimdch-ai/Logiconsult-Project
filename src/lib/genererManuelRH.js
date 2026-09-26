// src/lib/genererManuelRH.js
//
// Génère le manuel de procédures RH. À coller dans src/lib/.

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
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } })
}

export async function genererManuelRH({ client, fiche }) {
  const nomClient = client?.nom || "l'organisation"
  const effectif = fiche?.effectif_total ? `${fiche.effectif_total} personne(s)` : 'à préciser'

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'MANUEL DE PROCÉDURES', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: 'DE GESTION DES RESSOURCES HUMAINES', bold: true, color: NAVY, size: 32 })] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 24 })] }),

        h1('1. Objet et champ d\u2019application'),
        p(`Le présent manuel définit les règles de gestion des ressources humaines applicables au sein de ${nomClient} (effectif actuel : ${effectif}). Il s'applique à l'ensemble du personnel, quel que soit son statut contractuel.`),

        h1('2. Recrutement'),
        p('Tout recrutement fait l\u2019objet d\u2019une expression de besoin validée par la direction, suivie d\u2019un appel à candidatures (interne ou externe selon le poste), d\u2019une présélection sur dossier, puis d\u2019un entretien.'),
        bullet('Publication de l\u2019offre avec fiche de poste jointe'),
        bullet('Présélection sur la base de critères objectifs et documentés'),
        bullet('Entretien mené par au moins deux personnes'),
        bullet('Vérification des références avant décision finale'),

        h1('3. Fiches de poste'),
        p('Chaque fonction de l\u2019organisation dispose d\u2019une fiche de poste décrivant sa mission, ses responsabilités, les compétences requises et son rattachement hiérarchique. Les fiches de poste sont revues au minimum tous les deux ans.'),

        h1('4. Intégration des nouveaux employés'),
        p('Tout nouvel employé bénéficie d\u2019un parcours d\u2019intégration comprenant la présentation de l\u2019organisation, de ses procédures internes, et de son équipe de rattachement.'),

        h1('5. Évaluation de la performance'),
        p('Chaque employé fait l\u2019objet d\u2019une évaluation annuelle formalisée, basée sur des objectifs fixés en début de période et sur les compétences attendues pour son poste. L\u2019évaluation donne lieu à un entretien individuel.'),

        h1('6. Formation et renforcement des capacités'),
        p('Un plan de formation est élaboré chaque année sur la base des besoins identifiés lors des évaluations et des priorités stratégiques de l\u2019organisation.'),

        h1('7. Rémunération et avantages'),
        p('La grille de rémunération est définie par la direction et validée par les instances de gouvernance. Elle est appliquée de manière équitable et non discriminatoire.'),

        h1('8. Motivation et rétention'),
        p('L\u2019organisation met en place des mécanismes de reconnaissance du travail (évolution de poste, formation, aménagements) afin de limiter le turnover et préserver les compétences clés.'),

        h1('9. Discipline et fin de contrat'),
        p('Les procédures disciplinaires et les modalités de fin de contrat sont précisées dans le règlement intérieur de l\u2019organisation.'),

        h1('10. Révision du manuel'),
        p('Le présent manuel est révisé au minimum tous les deux ans ou à chaque évolution significative de la réglementation du travail applicable.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `Manuel_RH_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
