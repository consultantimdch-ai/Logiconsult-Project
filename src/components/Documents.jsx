// src/components/Documents.jsx
//
// Onglet "Documents" : boutons de génération/téléchargement des documents de mission.
// Pour l'instant : Tableau de bord projet (Excel). D'autres viendront s'ajouter ici.
// À coller dans src/components/.

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { genererTableauBordExcel } from '../lib/genererTableauBordExcel'
import { genererCadreLogique } from '../lib/genererCadreLogique'
import { genererPlanSuiviEvaluation } from '../lib/genererPlanSuiviEvaluation'
import { genererRegistreRisques } from '../lib/genererRegistreRisques'
import { genererPlanPartiesPrenantes } from '../lib/genererPlanPartiesPrenantes'
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

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

export default function Documents({ mission }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleGenererTableauBord() {
    setBusy(true)
    setMsg('')
    try {
      const [{ data: client }, { data: fiche }, { data: indicateurs }, { data: jalons }, { data: budget }] = await Promise.all([
        supabase.from('clients').select('*').eq('id', mission.clients?.id).single(),
        supabase.from('fiche_projet').select('*').eq('mission_id', mission.id).maybeSingle(),
        supabase.from('indicateurs').select('*').eq('mission_id', mission.id),
        supabase.from('jalons').select('*').eq('mission_id', mission.id),
        supabase.from('budget_lignes').select('*').eq('mission_id', mission.id),
      ])

      await genererTableauBordExcel({ mission, client, fiche, indicateurs, jalons, budget })
      setMsg('Tableau de bord téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function fetchDonneesProjet() {
    const [{ data: client }, { data: fiche }, { data: indicateurs }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', mission.clients?.id).single(),
      supabase.from('fiche_projet').select('*').eq('mission_id', mission.id).maybeSingle(),
      supabase.from('indicateurs').select('*').eq('mission_id', mission.id),
    ])
    return { client, fiche, indicateurs }
  }

  async function handleGenererCadreLogique() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche, indicateurs } = await fetchDonneesProjet()
      await genererCadreLogique({ client, fiche, indicateurs })
      setMsg('Cadre logique téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererPlanSE() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche, indicateurs } = await fetchDonneesProjet()
      await genererPlanSuiviEvaluation({ client, fiche, indicateurs })
      setMsg('Plan de suivi-évaluation téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererRegistreRisques() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchDonneesProjet()
      await genererRegistreRisques({ client, fiche })
      setMsg('Registre des risques téléchargé.')
    } catch (err) {
      setMsg('Erreur : ' + err.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMsg(''), 4000)
    }
  }

  async function handleGenererPartiesPrenantes() {
    setBusy(true)
    setMsg('')
    try {
      const { client, fiche } = await fetchDonneesProjet()
      await genererPlanPartiesPrenantes({ client, fiche })
      setMsg('Plan parties prenantes téléchargé.')
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

  const disponibleProjet = mission.domaines.includes('projet')
  const disponibleFinancier = mission.domaines.includes('financier')
  const disponibleOrganisationnel = mission.domaines.includes('organisationnel')

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

      {!disponibleProjet && !disponibleFinancier && !disponibleOrganisationnel && (
        <p style={{ fontSize: 13, color: '#666' }}>
          Aucun domaine avec documents disponibles n'est sélectionné pour cette mission.
        </p>
      )}

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {disponibleProjet && (
          <>
            <DocCard
              titre="Tableau de bord de suivi de projet"
              description="Fiche projet, indicateurs, jalons, budget (avec formules)."
              onClick={handleGenererTableauBord}
              busy={busy}
            />
            <DocCard
              titre="Cadre logique"
              description="Objectif global, objectifs spécifiques, résultats, indicateurs."
              onClick={handleGenererCadreLogique}
              busy={busy}
            />
            <DocCard
              titre="Plan de suivi-évaluation (MEAL)"
              description="Basé directement sur les indicateurs saisis."
              onClick={handleGenererPlanSE}
              busy={busy}
            />
            <DocCard
              titre="Registre des risques"
              description="Avec exemples et niveau de risque calculé automatiquement."
              onClick={handleGenererRegistreRisques}
              busy={busy}
            />
            <DocCard
              titre="Plan parties prenantes"
              description="Cartographie et stratégie de communication par partie prenante."
              onClick={handleGenererPartiesPrenantes}
              busy={busy}
            />
          </>
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
      </div>

      {msg && <p style={{ fontSize: 12, color: msg.startsWith('Erreur') ? '#C0392B' : '#2E7D32', marginTop: 14 }}>{msg}</p>}

      <p style={{ fontSize: 11, color: '#999', marginTop: 24 }}>
        D'autres documents (cadre logique, plan de suivi-évaluation, registre des risques...) seront ajoutés ici progressivement.
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
