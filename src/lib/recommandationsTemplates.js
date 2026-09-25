// src/lib/recommandationsTemplates.js
//
// Formulation professionnelle des recommandations, une par critère (1 à 55),
// sous forme de phrase à l'impératif expliquant le "pourquoi" / bénéfice attendu.
// Indexé par le champ "numero" de la table criteres_audit.

export const RECOMMANDATIONS_PAR_NUMERO = {
  // ---- Domaine 1 : Gestion de projet ----
  1: "Formaliser une charte de projet précisant l'objet, les objectifs et le périmètre, pour donner un cadre de référence partagé dès le lancement.",
  2: "Définir des objectifs SMART et les valider avec les parties prenantes, afin d'aligner les attentes et de faciliter le suivi des résultats.",
  3: "Élaborer un planning détaillé avec jalons et livrables clairement identifiés, pour sécuriser le respect des délais.",
  4: "Élaborer et faire valider un budget prévisionnel chiffré, afin d'anticiper les besoins financiers et d'éviter les dérapages.",
  5: "Réaliser et documenter une analyse des risques dès le cadrage, pour anticiper les obstacles et préparer des mesures de mitigation.",
  6: "Définir des indicateurs de performance (KPI) et en assurer le suivi régulier, pour objectiver l'avancement du projet.",
  7: "Instaurer des comités de pilotage réguliers avec comptes rendus systématiques, afin de garantir une prise de décision éclairée et documentée.",
  8: "Mettre à jour et partager régulièrement un tableau de bord de suivi, pour donner à l'équipe et aux parties prenantes une visibilité continue sur l'avancement.",
  9: "Actualiser en continu le registre des risques, afin de réagir rapidement à l'évolution du contexte du projet.",
  10: "Formaliser une cartographie des parties prenantes et un plan de communication associé, pour sécuriser leur adhésion et anticiper les résistances.",
  11: "Ajuster l'allocation des ressources humaines et matérielles aux besoins réels du projet, pour éviter les goulots d'étranglement dans l'exécution.",
  12: "Clarifier les rôles et responsabilités au moyen d'une matrice RACI (ou équivalent), afin d'éviter les zones de flou et les doublons d'action.",
  13: "Structurer la communication d'équipe par des réunions régulières et des comptes rendus systématiques, pour fluidifier la coordination.",
  14: "Tracer et justifier systématiquement les modifications et avenants au projet, afin de garantir la transparence et la maîtrise des changements.",
  15: "Réaliser un bilan de fin de projet analysant l'atteinte des objectifs et les écarts constatés, pour capitaliser sur l'expérience acquise.",
  16: "Documenter et partager un retour d'expérience (leçons apprises), afin d'améliorer la conduite des projets futurs.",
  17: "Structurer l'archivage des documents du projet, pour en garantir la traçabilité et faciliter les audits ultérieurs.",
  18: "Formaliser le transfert et la passation en fin de mission, afin d'assurer la continuité des activités après le départ de l'équipe projet.",

  // ---- Domaine 2 : Gestion financière ----
  19: "Assurer une tenue régulière de la comptabilité conforme au référentiel SYSCOHADA, pour garantir la fiabilité et la conformité légale des comptes.",
  20: "Respecter systématiquement les obligations fiscales et les délais de déclaration auprès de la DGID, afin d'éviter redressements et pénalités.",
  21: "Organiser un archivage exhaustif et conforme des pièces justificatives, pour sécuriser l'organisation en cas de contrôle ou d'audit.",
  22: "Séparer effectivement les fonctions comptabilité et trésorerie, afin de réduire les risques d'erreur et de fraude.",
  23: "Soumettre les comptes à un audit ou une certification externe, pour renforcer la crédibilité financière de l'organisation auprès de ses partenaires.",
  24: "Formaliser l'élaboration budgétaire annuelle et la faire valider par les instances, afin d'ancrer la gestion financière dans une gouvernance claire.",
  25: "Mettre en place un suivi budgétaire périodique comparant réalisé et prévisionnel, pour détecter rapidement les écarts et ajuster les décisions.",
  26: "Actualiser régulièrement un plan de trésorerie prévisionnel, afin d'anticiper les tensions de trésorerie et sécuriser les paiements.",
  27: "Définir et faire respecter des procédures de décaissement claires, pour prévenir les dépenses non autorisées.",
  28: "Anticiper la gestion des excédents et déficits de trésorerie, afin d'optimiser l'utilisation des ressources financières disponibles.",
  29: "Séparer les tâches d'engagement, de paiement et de contrôle, pour renforcer le contrôle interne et limiter les risques de fraude.",
  30: "Définir clairement les niveaux d'autorisation des dépenses selon leur montant, afin d'encadrer les engagements financiers.",
  31: "Réaliser des rapprochements bancaires réguliers, pour détecter rapidement toute anomalie sur les comptes.",
  32: "Tenir à jour un inventaire physique des immobilisations, afin de sécuriser le patrimoine de l'organisation et fiabiliser les états financiers.",
  33: "Mettre en place des procédures de prévention de la fraude et des conflits d'intérêt, pour protéger l'intégrité financière de l'organisation.",
  34: "Produire les états financiers dans les délais réglementaires, afin d'éviter tout manquement vis-à-vis des autorités et partenaires.",
  35: "Mettre à disposition de la direction des tableaux de bord financiers réguliers, pour éclairer la prise de décision stratégique.",
  36: "Réaliser une analyse périodique des ratios financiers (liquidité, solvabilité, rentabilité), afin d'évaluer objectivement la santé financière de l'organisation.",
  37: "Structurer la communication financière vers les bailleurs et actionnaires, pour renforcer la confiance et faciliter les futurs financements.",

  // ---- Domaine 3 : Gestion organisationnelle ----
  38: "Formaliser, diffuser et actualiser l'organigramme, afin de clarifier la structure hiérarchique et les lignes de responsabilité.",
  39: "Mettre à jour les statuts et textes fondateurs et veiller à leur application effective, pour asseoir la légitimité et la conformité de l'organisation.",
  40: "Rendre pleinement fonctionnelles les instances de gouvernance (CA, AG), afin de garantir un pilotage stratégique régulier et légitime.",
  41: "Clarifier sans ambiguïté les rôles de direction, pour éviter les conflits de compétence et fluidifier la prise de décision.",
  42: "Formaliser un système de délégation de pouvoir, afin de sécuriser juridiquement les décisions prises par les responsables délégués.",
  43: "Formaliser et appliquer une politique de recrutement, pour garantir l'équité et la qualité des recrutements.",
  44: "Élaborer et diffuser des fiches de poste à jour pour chaque fonction, afin que chaque employé connaisse précisément son rôle et ses responsabilités.",
  45: "Mettre en œuvre un système d'évaluation de la performance, pour objectiver la reconnaissance du travail et orienter le développement des compétences.",
  46: "Élaborer un plan de formation et de renforcement des capacités, afin de développer durablement les compétences internes.",
  47: "Mettre en place une politique de motivation et de rétention du personnel, pour réduire le turnover et préserver les compétences clés.",
  48: "Élaborer et diffuser un manuel de procédures administratives, afin d'harmoniser les pratiques et de sécuriser la continuité en cas de départ.",
  49: "Digitaliser les procédures clés et déployer des systèmes d'information adaptés, pour gagner en efficacité et en fiabilité.",
  50: "Structurer un système de gestion documentaire (archivage, GED), afin de sécuriser l'accès à l'information et sa conservation dans le temps.",
  51: "Engager une démarche qualité ou d'amélioration continue, pour ancrer une culture de progrès permanent dans l'organisation.",
  52: "Structurer la communication interne par des réunions régulières et des notes de service, afin de renforcer la cohésion et la circulation de l'information.",
  53: "Organiser et accompagner la gestion du changement, pour limiter les résistances et sécuriser l'adhésion du personnel aux réformes.",
  54: "Évaluer périodiquement le style de leadership et la cohésion d'équipe, afin d'identifier les leviers d'amélioration du climat de travail.",
  55: "Mettre en place des mécanismes formels de gestion des conflits internes, pour prévenir leur escalade et préserver un climat de travail sain.",
}

// Filet de sécurité si un critère n'a pas (encore) de formulation dédiée
export function recommandationParDefaut(libelle) {
  return `Corriger le point suivant, actuellement en écart par rapport aux bonnes pratiques attendues : ${libelle}.`
}
