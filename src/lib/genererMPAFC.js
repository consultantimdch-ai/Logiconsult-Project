// src/lib/genererMPAFC.js
//
// Génère le Manuel de Procédures Administratives, Financières et Comptables (MPAFC),
// personnalisé avec les données de la fiche financière de la mission.
// À coller dans src/lib/.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle,
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
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 21, bold: !!opts.bold, italics: !!opts.italics })],
  })
}
function bullet(text) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 60 } })
}

export async function genererMPAFC({ client, fiche, mission }) {
  const nomClient = client?.nom || "l'organisation"
  const banques = fiche?.banques_comptes || 'à préciser'
  const seuils = fiche?.seuils_autorisation || "à définir avec la direction"
  const logiciel = fiche?.logiciel_comptable || 'à préciser'
  const exercice = fiche?.exercice_comptable || 'à préciser'

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({ text: 'MANUEL DE PROCÉDURES ADMINISTRATIVES,', bold: true, color: NAVY, size: 36 })],
        }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: 'FINANCIÈRES ET COMPTABLES (MPAFC)', bold: true, color: NAVY, size: 36 })],
        }),
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: nomClient, bold: true, color: GOLD, size: 26 })],
        }),
        new Paragraph({
          spacing: { after: 400 },
          children: [new TextRun({ text: 'Élaboré par Imadou-Dini IMOROU — Consultant en Management Organisationnel & SERA/MEAL', italics: true, size: 18 })],
        }),

        h1('1. Préambule et champ d\u2019application'),
        p(`Le présent manuel définit les règles et procédures administratives, financières et comptables applicables au sein de ${nomClient}. Il s'applique à l'ensemble du personnel impliqué dans la gestion financière, ainsi qu'aux organes de gouvernance dans leur rôle de contrôle.`),
        p(`Il a pour objectif de garantir la transparence, la fiabilité de l'information financière, la conformité au référentiel comptable SYSCOHADA, et la protection du patrimoine de l'organisation.`),

        h1('2. Organisation comptable'),
        p(`La comptabilité de ${nomClient} est tenue conformément au référentiel SYSCOHADA, sur l'exercice comptable suivant : ${exercice}.`),
        p(`Logiciel de comptabilité utilisé : ${logiciel}.`),
        p('Toute pièce comptable doit être numérotée, classée chronologiquement, et conservée pendant une durée minimale de 10 ans conformément à la réglementation en vigueur.'),

        h1('3. Circuit des dépenses et niveaux d\u2019autorisation'),
        p(`Les niveaux d'autorisation de dépense retenus sont les suivants : ${seuils}.`),
        p('Toute dépense doit suivre le circuit suivant :'),
        bullet('Expression du besoin par le service demandeur'),
        bullet('Vérification de la disponibilité budgétaire'),
        bullet('Validation par le niveau d\u2019autorisation compétent selon le seuil'),
        bullet('Engagement de la dépense (bon de commande ou équivalent)'),
        bullet('Réception et certification du service fait'),
        bullet('Paiement, uniquement sur pièces justificatives complètes'),

        h1('4. Séparation des tâches'),
        p('Afin de limiter les risques d\u2019erreur et de fraude, les fonctions suivantes doivent être exercées par des personnes distinctes :'),
        bullet('Engagement de la dépense'),
        bullet('Contrôle et validation'),
        bullet('Paiement / décaissement'),
        bullet('Enregistrement comptable'),
        p('Lorsque l\u2019effectif de l\u2019organisation ne permet pas une séparation complète, des mesures de contrôle compensatoires doivent être mises en place (double signature, contrôle a posteriori renforcé, etc.).'),

        h1('5. Gestion de la trésorerie'),
        p(`Les comptes et établissements financiers utilisés sont : ${banques}.`),
        p('Tout mouvement de trésorerie doit faire l\u2019objet d\u2019un rapprochement bancaire mensuel, réalisé par une personne distincte de celle qui effectue les paiements.'),
        p('La caisse fait l\u2019objet d\u2019un arrêté et d\u2019un contrôle physique au minimum une fois par mois.'),

        h1('6. Gestion des immobilisations'),
        p('Toute acquisition d\u2019immobilisation doit être enregistrée dans un registre des immobilisations, avec numéro d\u2019inventaire, date d\u2019acquisition, valeur d\u2019origine et localisation.'),
        p('Un inventaire physique contradictoire est réalisé au minimum une fois par an.'),

        h1('7. Contrôle interne et prévention de la fraude'),
        p('L\u2019organisation met en place les mécanismes de contrôle interne suivants : contrôle a priori des engagements de dépense, rapprochements bancaires réguliers, inventaires physiques, et procédure de signalement en cas de suspicion de fraude ou de conflit d\u2019intérêt.'),

        h1('8. Archivage'),
        p('L\u2019ensemble des pièces justificatives, contrats et documents financiers est archivé de manière structurée, avec un accès restreint aux personnes autorisées.'),

        h1('9. Révision du manuel'),
        p('Le présent manuel est révisé au minimum tous les deux ans, ou à chaque évolution significative de l\u2019organisation ou de la réglementation applicable.'),
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `MPAFC_${nomClient.replace(/[^a-zA-Z0-9]/g, '_')}.docx`)
}
