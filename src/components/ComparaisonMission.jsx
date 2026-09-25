// src/components/ComparaisonMission.jsx
//
// Compare les scores de la mission actuelle à ceux de la mission précédente
// pour le même client (si elle existe). À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'
const GREEN = '#2E7D32'
const RED = '#C0392B'

const DOMAINE_LABELS = {
  projet: 'Gestion de projet',
  financier: 'Gestion financière',
  organisationnel: 'Gestion organisationnelle',
}

export default function ComparaisonMission({ mission, criteresActuels, scoresActuels }) {
  const [missionPrecedente, setMissionPrecedente] = useState(null)
  const [scoresPrecedents, setScoresPrecedents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mission?.mission_precedente_id) {
      setLoading(false)
      return
    }
    load()
  }, [mission])

  async function load() {
    setLoading(true)
    const { data: prevMission } = await supabase
      .from('missions')
      .select('id, date_mission, domaines')
      .eq('id', mission.mission_precedente_id)
      .single()
    setMissionPrecedente(prevMission)

    const { data: prevScores } = await supabase
      .from('audit_scores')
      .select('critere_id, score, criteres_audit(domaine)')
      .eq('mission_id', mission.mission_precedente_id)
    setScoresPrecedents(prevScores || [])
    setLoading(false)
  }

  if (loading) return null
  if (!mission?.mission_precedente_id || !missionPrecedente) {
    return (
      <p style={{ fontSize: 13, color: '#666', marginTop: 20 }}>
        Aucune mission précédente enregistrée pour ce client — pas de comparaison disponible.
      </p>
    )
  }

  function moyennePrecedente(domaine) {
    const notes = scoresPrecedents
      .filter((s) => s.criteres_audit?.domaine === domaine)
      .map((s) => s.score)
    if (notes.length === 0) return null
    return notes.reduce((a, b) => a + b, 0) / notes.length
  }

  function moyenneActuelle(domaine) {
    const critsDom = criteresActuels.filter((c) => c.domaine === domaine)
    const notes = critsDom
      .map((c) => scoresActuels[c.id]?.score)
      .filter((s) => s !== '' && s !== undefined && s !== null)
    if (notes.length === 0) return null
    return notes.reduce((a, b) => a + Number(b), 0) / notes.length
  }

  const domainesCommuns = mission.domaines.filter((d) => missionPrecedente.domaines.includes(d))

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 6 }}>
        Évolution depuis la mission précédente
      </h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        Mission précédente du {new Date(missionPrecedente.date_mission).toLocaleDateString('fr-FR')}
      </p>

      {domainesCommuns.length === 0 && (
        <p style={{ fontSize: 13, color: '#666' }}>
          Aucun domaine commun entre les deux missions.
        </p>
      )}

      {domainesCommuns.map((d) => {
        const avant = moyennePrecedente(d)
        const apres = moyenneActuelle(d)
        const delta = avant !== null && apres !== null ? apres - avant : null
        return (
          <div
            key={d}
            style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '10px 14px',
              backgroundColor: '#F9F6EF', borderRadius: 8, marginBottom: 8,
            }}
          >
            <div style={{ flex: 1, fontWeight: 'bold', color: NAVY, fontSize: 13 }}>
              {DOMAINE_LABELS[d]}
            </div>
            <div style={{ fontSize: 13 }}>
              {avant !== null ? avant.toFixed(1) : '—'} / 5
              <span style={{ color: '#999' }}> → </span>
              {apres !== null ? apres.toFixed(1) : '—'} / 5
            </div>
            {delta !== null && (
              <div style={{ fontWeight: 'bold', fontSize: 13, color: delta >= 0 ? GREEN : RED, minWidth: 60, textAlign: 'right' }}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
