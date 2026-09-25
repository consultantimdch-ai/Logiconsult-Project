// src/components/MissionDetail.jsx
//
// Écran de mission : grille d'audit interactive (notation des critères par domaine),
// avec synthèse des scores en temps réel. À coller dans ton projet.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'
const LIGHTGOLD = '#F3ECDD'

const DOMAINE_LABELS = {
  projet: 'Gestion de projet',
  financier: 'Gestion financière',
  organisationnel: 'Gestion organisationnelle',
}

const NIVEAUX = [
  { value: '', label: '—' },
  { value: 1, label: '1 · Inexistant' },
  { value: 2, label: '2 · Initial' },
  { value: 3, label: '3 · En développement' },
  { value: 4, label: '4 · Maîtrisé' },
  { value: 5, label: '5 · Optimisé' },
]

export default function MissionDetail({ missionId, onBack }) {
  const [mission, setMission] = useState(null)
  const [criteres, setCriteres] = useState([])
  const [scores, setScores] = useState({}) // { critere_id: { score, commentaire } }
  const [activeDomaine, setActiveDomaine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAll()
  }, [missionId])

  async function loadAll() {
    setLoading(true)
    setError(null)
    try {
      const { data: missionData, error: missionErr } = await supabase
        .from('missions')
        .select('id, date_mission, domaines, statut, clients ( id, nom, secteur_activite )')
        .eq('id', missionId)
        .single()
      if (missionErr) throw missionErr
      setMission(missionData)
      setActiveDomaine(missionData.domaines[0])

      const { data: criteresData, error: criteresErr } = await supabase
        .from('criteres_audit')
        .select('id, domaine, axe, numero, libelle')
        .in('domaine', missionData.domaines)
        .order('numero')
      if (criteresErr) throw criteresErr
      setCriteres(criteresData)

      const { data: scoresData, error: scoresErr } = await supabase
        .from('audit_scores')
        .select('critere_id, score, commentaire')
        .eq('mission_id', missionId)
      if (scoresErr) throw scoresErr

      const scoreMap = {}
      scoresData.forEach((s) => {
        scoreMap[s.critere_id] = { score: s.score ?? '', commentaire: s.commentaire ?? '' }
      })
      setScores(scoreMap)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateScore(critereId, field, value) {
    setScores((prev) => ({
      ...prev,
      [critereId]: { ...prev[critereId], [field]: value },
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg('')
    setError(null)
    try {
      const rows = Object.entries(scores)
        .filter(([, v]) => v.score !== '' && v.score !== undefined)
        .map(([critere_id, v]) => ({
          mission_id: missionId,
          critere_id,
          score: Number(v.score),
          commentaire: v.commentaire || null,
        }))

      if (rows.length > 0) {
        const { error: upsertErr } = await supabase
          .from('audit_scores')
          .upsert(rows, { onConflict: 'mission_id,critere_id' })
        if (upsertErr) throw upsertErr
      }
      setSaveMsg('Enregistré.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 3000)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Chargement…</div>
  if (error) return <div style={{ padding: 24, color: '#c0392b' }}>Erreur : {error}</div>
  if (!mission) return null

  const criteresDuDomaine = criteres.filter((c) => c.domaine === activeDomaine)

  // Regroupement par axe pour affichage
  const axes = [...new Set(criteresDuDomaine.map((c) => c.axe))]

  // Synthèse : moyenne par domaine (sur les critères notés)
  function moyenneDomaine(domaine) {
    const critsDom = criteres.filter((c) => c.domaine === domaine)
    const notes = critsDom
      .map((c) => scores[c.id]?.score)
      .filter((s) => s !== '' && s !== undefined && s !== null)
    if (notes.length === 0) return null
    const avg = notes.reduce((a, b) => a + Number(b), 0) / notes.length
    return avg.toFixed(1)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'Arial, sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
        ← Retour aux missions
      </button>

      <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 'bold', margin: 0 }}>
        {mission.clients?.nom}
      </h1>
      <p style={{ color: '#666', fontSize: 13, margin: '4px 0 20px' }}>
        Mission du {new Date(mission.date_mission).toLocaleDateString('fr-FR')}
      </p>

      {/* Synthèse rapide par domaine */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {mission.domaines.map((d) => {
          const moy = moyenneDomaine(d)
          return (
            <div key={d} style={{ backgroundColor: LIGHTGOLD, padding: '10px 16px', borderRadius: 8, fontSize: 13 }}>
              <strong style={{ color: NAVY }}>{DOMAINE_LABELS[d]}</strong>
              <div style={{ color: GOLD, fontWeight: 'bold', fontSize: 18 }}>
                {moy ? `${moy} / 5` : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Onglets domaines */}
      <div style={{ display: 'flex', borderBottom: `2px solid ${NAVY}`, marginBottom: 16 }}>
        {mission.domaines.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDomaine(d)}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 'bold',
              backgroundColor: activeDomaine === d ? NAVY : 'transparent',
              color: activeDomaine === d ? '#fff' : NAVY,
              borderRadius: '6px 6px 0 0',
            }}
          >
            {DOMAINE_LABELS[d]}
          </button>
        ))}
      </div>

      {/* Grille de critères */}
      {axes.map((axe) => (
        <div key={axe} style={{ marginBottom: 20 }}>
          <h3 style={{ color: GOLD, fontSize: 14, marginBottom: 8 }}>{axe}</h3>
          {criteresDuDomaine
            .filter((c) => c.axe === axe)
            .map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '10px 0', borderBottom: '1px solid #eee',
                }}
              >
                <div style={{ flex: 1, fontSize: 13 }}>{c.libelle}</div>
                <select
                  value={scores[c.id]?.score ?? ''}
                  onChange={(e) => updateScore(c.id, 'score', e.target.value)}
                  style={{ width: 170, padding: 6, fontSize: 12, borderRadius: 6, border: '1px solid #ccc' }}
                >
                  {NIVEAUX.map((n) => (
                    <option key={n.value} value={n.value}>{n.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Commentaire (optionnel)"
                  value={scores[c.id]?.commentaire ?? ''}
                  onChange={(e) => updateScore(c.id, 'commentaire', e.target.value)}
                  style={{ width: 220, padding: 6, fontSize: 12, borderRadius: 6, border: '1px solid #ccc' }}
                />
              </div>
            ))}
        </div>
      ))}

      <div style={{ position: 'sticky', bottom: 0, backgroundColor: '#fff', padding: '12px 0', borderTop: '1px solid #ddd' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: NAVY, color: '#fff', border: 'none', padding: '10px 20px',
            borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 14,
          }}
        >
          {saving ? 'Enregistrement…' : 'Enregistrer la grille'}
        </button>
        {saveMsg && <span style={{ marginLeft: 12, color: '#2E7D32', fontSize: 13 }}>{saveMsg}</span>}
      </div>
    </div>
  )
}
