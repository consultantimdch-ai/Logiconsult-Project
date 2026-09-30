// src/components/Documents.jsx
//
// Onglet "Documents" : boutons de génération/téléchargement des documents de mission.
// Pour l'instant : Tableau de bord projet (Excel). D'autres viendront s'ajouter ici.
// À coller dans src/components/.

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { genererRapportAudit } from '../lib/genererRapportAudit'
import { genererPlanComptable } from '../lib/genererPlanComptable'
import { genererModeleBudget } from '../lib/genererModeleBudget'
import { genererPlanTresorerie } from '../lib/genererPlanTresorerie'
import { genererMPAFC } from '../lib/genererMPAFC'
import { genererGrilleDelegation } from '../lib/genererGrilleDelegation'
import { genererRapportBailleur } from '../lib/genererRapportBailleur'
import { genererOrganigramme } from '../lib/genererOrganigramme'
import { genererManuelRH } from '../lib/genererManuelRH'
import { genererReglementInterieur } from '../lib/genererReglementInterieur'
import { genererFicheDePoste } from '../lib/genererFicheDePoste'
import { genererManuelGouvernance } from '../lib/genererManuelGouvernance'
import { genererPlanStrategique } from '../lib/genererPlanStrategique'
import { genererMatriceSWOT } from '../lib/genererMatriceSWOT'
import { genererTableauBordStrategique } from '../lib/genererTableauBordStrategique'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

export default function Documents({ mission }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleGenererRapportAudit() {
    setBusy(true)
    setMsg('')
    try {
      const { data: client } = await supabase.from('clients').select('*').eq('id', mission.clients?.id).single()

      const { data: criteres } = await supabase
        .from('criteres_audit')
        .select('id, domaine, axe, numero, libelle')
        .in('domaine', mission.domaines)
        .order('numero')

      const { data: scoresData } = await supabase
        .from('audit_scores')
        .select('critere_id, score, commentaire')
        .eq('mission_id', mission.id)
      const scores = {}
      ;(scoresData || []).forEach((s) => { scores[s.critere_id] = { score: s.score, commentaire: s.commentaire } })

      const { data: recommandations } = await supabase
        .from('recommandations')
        .select('texte, statut')
        .eq('mission_id', mission.id)

      let missionPrecedente = null
      let scoresPrecedents = []
      if (mission.mission_precedente_id) {
        const { data: prevMission } = await supabase
          .from('missions')
          .select('id, date_mission, domaines')
          .eq('id', mission.mission_precedente_id)
          .single()
        missionPrecedente = prevMission
        const { data: prevScores } = await supabase
          .from('audit_scores')
          .select('critere_id, score, criteres_audit(domaine)')
          .eq('mission_id', mission.mission_precedente_id)
        scoresPrecedents = prevScores || []
      }

      await genererRapportAudit({ client, mission, criteres: criteres || [], scores, recommandations, missionPrecedente, scoresPrecedents })
      setMsg("Rapport d'audit téléchargé.")
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function fetchClientEtFiche(ficheTable) {
    const [{ data: client }, { data: fiche }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', mission.clients?.id).single(),
      ficheTable
        ? supabase.from(ficheTable).select('*').eq('mission_id', mission.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    return { client, fiche }
  }

  async function handleGenererPlanComptable() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_financiere')
      await genererPlanComptable({ client, fiche })
      setMsg('Plan comptable téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererModeleBudget() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_financiere')
      await genererModeleBudget({ client, fiche, exercice: fiche?.exercice_comptable })
      setMsg('Modèle de budget téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererPlanTresorerie() {
    setBusy(true)
    setMsg('')
    try {
      const { client } = await fetchClientEtFiche(null)
      await genererPlanTresorerie({ client, soldeInitial: 0 })
      setMsg('Plan de trésorerie téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererMPAFC() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_financiere')
      await genererMPAFC({ client, fiche, mission })
      setMsg('MPAFC téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererGrilleDelegation() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_financiere')
      await genererGrilleDelegation({ client, fiche })
      setMsg('Grille de délégation téléchargée.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererRapportBailleur() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_financiere')
      const { data: budget } = await supabase.from('budget_lignes').select('*').eq('mission_id', mission.id)
      await genererRapportBailleur({ client, mission, fiche, budget })
      setMsg('Rapport bailleur téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  const disponibleFinancier = mission.domaines.includes('financier')
  const disponibleOrganisationnel = mission.domaines.includes('organisationnel')
  const disponibleStrategique = mission.domaines.includes('strategique')

  async function genererStrat(fn, label) {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_strategique')
      await fn({ client, fiche })
      setMsg(`${label} téléchargé(e).`)
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function genererOrga(fn, label) {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchClientEtFiche('fiche_organisationnelle')
      await fn({ client, fiche })
      setMsg(`${label} téléchargé(e).`)
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  return (
    <div>
      <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 16 }}>Documents générables</h2>

      <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        Le rapport d'audit est toujours disponible. Les documents ci-dessous dépendent des domaines sélectionnés pour cette mission.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <DocCard
          titre="Rapport d'audit complet"
          description="Synthèse des scores, points critiques, recommandations et évolution."
          onClick={handleGenererRapportAudit}
          busy={busy}
          format="Word"
        />

        {mission.domaines.includes('projet') && (
          <div style={{ border: '1px dashed #ccc', borderRadius: 8, padding: 16, width: 260, display: 'flex', alignItems: 'center', fontSize: 13, color: '#666' }}>
            Les documents du domaine Projet (tableau de bord, cadre logique, plan S&amp;E, registre des risques, parties prenantes) se génèrent depuis l'onglet <strong>"Projets"</strong> du Dashboard, sur le projet lié à cette mission.
          </div>
        )}

        {disponibleFinancier && (
          <>
            <DocCard
              titre="Plan comptable"
              description="Canevas SYSCOHADA de base, à adapter à l'activité."
              onClick={handleGenererPlanComptable}
              busy={busy}
              format="Excel"
            />
            <DocCard
              titre="Modèle de budget annuel"
              description="Produits/Charges avec répartition mensuelle et solde."
              onClick={handleGenererModeleBudget}
              busy={busy}
              format="Excel"
            />
            <DocCard
              titre="Plan de trésorerie prévisionnel"
              description="12 mois, entrées/sorties, solde cumulé calculé."
              onClick={handleGenererPlanTresorerie}
              busy={busy}
              format="Excel"
            />
            <DocCard
              titre="MPAFC"
              description="Manuel de procédures administratives, financières et comptables."
              onClick={handleGenererMPAFC}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Grille de délégation de signature"
              description="Niveaux d'autorisation de dépense par tranche de montant."
              onClick={handleGenererGrilleDelegation}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Rapport bailleur"
              description="Modèle de rapport financier périodique, pré-rempli avec le budget saisi."
              onClick={handleGenererRapportBailleur}
              busy={busy}
              format="Word"
            />
          </>
        )}

        {disponibleOrganisationnel && (
          <>
            <DocCard
              titre="Organigramme"
              description="Structure hiérarchique adaptée à l'effectif renseigné."
              onClick={() => genererOrga(genererOrganigramme, 'Organigramme')}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Manuel RH"
              description="Recrutement, évaluation, formation, motivation."
              onClick={() => genererOrga(genererManuelRH, 'Manuel RH')}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Règlement intérieur"
              description="Modèle de base — à faire valider par un juriste."
              onClick={() => genererOrga(genererReglementInterieur, 'Règlement intérieur')}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Fiche de poste (modèle)"
              description="Modèle vierge à dupliquer pour chaque fonction clé."
              onClick={() => genererOrga(genererFicheDePoste, 'Fiche de poste')}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Manuel de gouvernance"
              description="Rôles des instances (AG, CA, direction), fréquence de réunion."
              onClick={() => genererOrga(genererManuelGouvernance, 'Manuel de gouvernance')}
              busy={busy}
              format="Word"
            />
          </>
        )}

        {disponibleStrategique && (
          <>
            <DocCard
              titre="Plan stratégique"
              description="Vision, mission, valeurs, objectifs et axes stratégiques."
              onClick={() => genererStrat(genererPlanStrategique, 'Plan stratégique')}
              busy={busy}
              format="Word"
            />
            <DocCard
              titre="Matrice SWOT"
              description="Forces, Faiblesses, Opportunités, Menaces — prête à compléter."
              onClick={() => genererStrat(genererMatriceSWOT, 'Matrice SWOT')}
              busy={busy}
              format="Excel"
            />
            <DocCard
              titre="Tableau de bord stratégique"
              description="Axes stratégiques pré-remplis, objectifs et indicateurs à compléter."
              onClick={() => genererStrat(genererTableauBordStrategique, 'Tableau de bord stratégique')}
              busy={busy}
              format="Excel"
            />
          </>
        )}
      </div>

      {msg && <p style={{ fontSize: 12, color: msg.startsWith('Erreur') ? '#C0392B' : '#2E7D32', marginTop: 14 }}>{msg}</p>}

      <p style={{ fontSize: 11, color: '#999', marginTop: 24 }}>
        Documents du domaine Projet disponibles depuis l'onglet "Projets" du Dashboard.
      </p>
    </div>
  )
}

function DocCard({ titre, description, onClick, busy, format = 'Excel' }) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, width: 260 }}>
      <div style={{ fontWeight: 'bold', color: NAVY, fontSize: 14, marginBottom: 4 }}>{titre}</div>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 12, minHeight: 32 }}>{description}</div>
      <button
        onClick={onClick}
        disabled={busy}
        style={{ backgroundColor: GOLD, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}
      >
        {busy ? 'Génération…' : `Télécharger (${format})`}
      </button>
    </div>
  )
}
