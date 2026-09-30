// src/components/Dashboard.jsx
//
// Écran d'accueil : onglets Missions / Projets. Le volet Projets est géré
// entièrement en interne (jamais besoin de toucher App.jsx pour ça).
// À coller dans ton projet.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ProjetsList from './ProjetsList'
import ProjetDetail from './ProjetDetail'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const STATUT_LABELS = {
  en_cours: { label: 'En cours', color: '#B08D3E' },
  finalise: { label: 'Finalisé', color: '#2E7D32' },
}

const DOMAINE_LABELS = {
  projet: 'Projet',
  financier: 'Financier',
  organisationnel: 'Organisationnel',
  strategique: 'Stratégique',
}

export default function Dashboard({ onOpenMission, onNewMission }) {
  const [vue, setVue] = useState('missions') // 'missions' | 'projets' | 'projet-detail'
  const [projetOuvertId, setProjetOuvertId] = useState(null)

  if (vue === 'projet-detail') {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <ProjetDetail projetId={projetOuvertId} onBack={() => setVue('projets')} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ color: NAVY, fontSize: 24, fontWeight: 'bold', margin: 0 }}>
          {vue === 'missions' ? 'Mes missions d\u2019audit' : 'Mes projets'}
        </h1>
        <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0' }}>
          Imadou-Dini IMOROU — Consultant en Management Organisationnel &amp; SERA/MEAL
        </p>
      </div>

      <div style={{ display: 'flex', gap: 4, margin: '16px 0 20px' }}>
        <button
          onClick={() => setVue('missions')}
          style={{
            padding: '8px 16px', border: `1px solid ${NAVY}`, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            backgroundColor: vue === 'missions' ? NAVY : '#fff', color: vue === 'missions' ? '#fff' : NAVY, borderRadius: 6,
          }}
        >
          Missions d'audit
        </button>
        <button
          onClick={() => setVue('projets')}
          style={{
            padding: '8px 16px', border: `1px solid ${NAVY}`, cursor: 'pointer', fontSize: 13, fontWeight: 'bold',
            backgroundColor: vue === 'projets' ? NAVY : '#fff', color: vue === 'projets' ? '#fff' : NAVY, borderRadius: 6,
          }}
        >
          Projets
        </button>
      </div>

      {vue === 'missions' && (
        <MissionsView onOpenMission={onOpenMission} onNewMission={onNewMission} />
      )}

      {vue === 'projets' && (
        <ProjetsList onOpenProjet={(id) => { setProjetOuvertId(id); setVue('projet-detail') }} />
      )}
    </div>
  )
}

function MissionsView({ onOpenMission, onNewMission }) {
  const [missions, setMissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMissions()
  }, [])

  async function fetchMissions() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('missions')
      .select(`
        id,
        date_mission,
        domaines,
        statut,
        clients ( id, nom, secteur_activite )
      `)
      .order('date_mission', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setMissions(data)
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={onNewMission}
          style={{
            backgroundColor: NAVY, color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: 6, fontWeight: 'bold',
            cursor: 'pointer', fontSize: 14,
          }}
        >
          + Nouvelle mission
        </button>
      </div>

      {loading && <p>Chargement…</p>}
      {error && <p style={{ color: '#c0392b' }}>Erreur : {error}</p>}

      {!loading && !error && missions.length === 0 && (
        <p style={{ color: '#666' }}>Aucune mission pour le moment. Clique sur "Nouvelle mission" pour commencer.</p>
      )}

      {!loading && missions.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: NAVY, color: '#fff' }}>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Domaines</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {missions.map((m, i) => (
              <tr
                key={m.id}
                style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#F3ECDD', cursor: 'pointer' }}
                onClick={() => onOpenMission(m.id)}
              >
                <td style={tdStyle}>
                  <strong>{m.clients?.nom}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>{m.clients?.secteur_activite}</div>
                </td>
                <td style={tdStyle}>{new Date(m.date_mission).toLocaleDateString('fr-FR')}</td>
                <td style={tdStyle}>
                  {m.domaines?.map((d) => DOMAINE_LABELS[d] || d).join(' · ')}
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: STATUT_LABELS[m.statut]?.color || '#666',
                    fontWeight: 'bold',
                  }}>
                    {STATUT_LABELS[m.statut]?.label || m.statut}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: GOLD, fontWeight: 'bold' }}>Ouvrir →</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 13 }
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #eee' }
