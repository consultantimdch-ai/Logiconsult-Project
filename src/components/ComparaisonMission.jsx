// src/components/ComparaisonMission.jsx
//
// Courbe de progression des scores par domaine, sur TOUTES les missions
// passées du même client (pas seulement la mission immédiatement précédente).
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const DOMAINE_LABELS = {
  projet: 'Gestion de projet',
  financier: 'Gestion financière',
  organisationnel: 'Gestion organisationnelle',
  strategique: 'Gestion stratégique',
}
const COULEURS = { projet: '#1B2A4A', financier: '#B08D3E', organisationnel: '#2E7D32', strategique: '#7A3E9D' }

export default function ComparaisonMission({ mission }) {
  const [historique, setHistorique] = useState([]) // [{date, domaine, moyenne}]
  const [nbMissions, setNbMissions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mission?.clients?.id) load()
  }, [mission])

  async function load() {
    setLoading(true)
    const { data: missionsClient } = await supabase
      .from('missions')
      .select('id, date_mission, domaines')
      .eq('client_id', mission.clients.id)
      .order('date_mission', { ascending: true })

    setNbMissions((missionsClient || []).length)

    const points = []
    for (const m of missionsClient || []) {
      const { data: scoresData } = await supabase
        .from('audit_scores')
        .select('score, criteres_audit(domaine)')
        .eq('mission_id', m.id)

      mission.domaines.forEach((d) => {
        const notes = (scoresData || [])
          .filter((s) => s.criteres_audit?.domaine === d)
          .map((s) => s.score)
        if (notes.length > 0) {
          const moyenne = notes.reduce((a, b) => a + b, 0) / notes.length
          points.push({ date: m.date_mission, domaine: d, moyenne, missionId: m.id })
        }
      })
    }
    setHistorique(points)
    setLoading(false)
  }

  if (loading) return null

  if (nbMissions <= 1) {
    return (
      <p style={{ fontSize: 13, color: '#666', marginTop: 20 }}>
        Aucune mission antérieure enregistrée pour ce client — la courbe de progression apparaîtra
        dès la prochaine mission d'audit.
      </p>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 6 }}>
        Progression sur {nbMissions} missions
      </h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
        Score moyen par domaine, mission après mission, pour ce client.
      </p>

      {mission.domaines.map((d) => {
        const serie = historique.filter((p) => p.domaine === d).sort((a, b) => new Date(a.date) - new Date(b.date))
        if (serie.length === 0) return null
        return (
          <div key={d} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 'bold', color: COULEURS[d], marginBottom: 6 }}>
              {DOMAINE_LABELS[d]}
            </p>
            <LineChart serie={serie} couleur={COULEURS[d]} />
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ serie, couleur, width = 520, height = 160 }) {
  const marginLeft = 30
  const marginBottom = 24
  const plotWidth = width - marginLeft - 10
  const plotHeight = height - marginBottom - 10

  const n = serie.length
  const xFor = (i) => marginLeft + (n === 1 ? plotWidth / 2 : (i * plotWidth) / (n - 1))
  const yFor = (v) => 10 + plotHeight - (v / 5) * plotHeight

  const pathPoints = serie.map((p, i) => `${xFor(i)},${yFor(p.moyenne)}`).join(' ')

  return (
    <svg width={width} height={height}>
      {/* grille horizontale (0 à 5) */}
      {[0, 1, 2, 3, 4, 5].map((v) => (
        <g key={v}>
          <line x1={marginLeft} y1={yFor(v)} x2={width - 10} y2={yFor(v)} stroke="#eee" strokeWidth="1" />
          <text x={marginLeft - 6} y={yFor(v) + 4} fontSize="9" textAnchor="end" fill="#999">{v}</text>
        </g>
      ))}

      <polyline points={pathPoints} fill="none" stroke={couleur} strokeWidth="2" />

      {serie.map((p, i) => (
        <g key={i}>
          <circle cx={xFor(i)} cy={yFor(p.moyenne)} r="4" fill={couleur} />
          <text x={xFor(i)} y={yFor(p.moyenne) - 8} fontSize="10" textAnchor="middle" fill={couleur} fontWeight="bold">
            {p.moyenne.toFixed(1)}
          </text>
          <text x={xFor(i)} y={height - 6} fontSize="9" textAnchor="middle" fill="#666">
            {new Date(p.date).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })}
          </text>
        </g>
      ))}
    </svg>
  )
}
