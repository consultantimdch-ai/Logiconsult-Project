// src/components/Documents.jsx
//
// Onglet "Documents" : boutons de génération/téléchargement des documents de mission.
// Pour l'instant : Tableau de bord projet (Excel). D'autres viendront s'ajouter ici.
// À coller dans src/components/.

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { genererTableauBordExcel } from '../lib/genererTableauBordExcel'

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

  const disponible = mission.domaines.includes('projet')

  return (
    <div>
      <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 16 }}>Documents générables</h2>

      {!disponible && (
        <p style={{ fontSize: 13, color: '#666' }}>
          Le domaine "Gestion de projet" n'est pas sélectionné pour cette mission — aucun document disponible pour l'instant.
        </p>
      )}

      {disponible && (
        <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, maxWidth: 400 }}>
          <div style={{ fontWeight: 'bold', color: NAVY, fontSize: 14, marginBottom: 4 }}>
            Tableau de bord de suivi de projet
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            Format Excel — fiche projet, indicateurs, jalons, budget (avec formules).
          </div>
          <button
            onClick={handleGenererTableauBord}
            disabled={busy}
            style={{ backgroundColor: GOLD, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}
          >
            {busy ? 'Génération…' : 'Télécharger (Excel)'}
          </button>
        </div>
      )}

      {msg && <p style={{ fontSize: 12, color: msg.startsWith('Erreur') ? '#C0392B' : '#2E7D32', marginTop: 10 }}>{msg}</p>}

      <p style={{ fontSize: 11, color: '#999', marginTop: 24 }}>
        D'autres documents (MPAFC, manuel de procédures, organigramme, cadre logique...) seront ajoutés ici progressivement.
      </p>
    </div>
  )
}
