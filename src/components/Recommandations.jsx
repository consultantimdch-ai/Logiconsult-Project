// src/components/Recommandations.jsx
//
// Suivi des recommandations : génération automatique à partir des critères notés ≤2,
// ajout manuel, suivi de statut (non entamée / en cours / réalisée).
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const STATUTS = [
  { value: 'non_entamee', label: 'Non entamée', color: '#C0392B' },
  { value: 'en_cours', label: 'En cours', color: '#B08D3E' },
  { value: 'realisee', label: 'Réalisée', color: '#2E7D32' },
]

export default function Recommandations({ missionId }) {
  const [recos, setRecos] = useState([])
  const [criteres, setCriteres] = useState([])
  const [scores, setScores] = useState([])
  const [nouveauTexte, setNouveauTexte] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadAll()
  }, [missionId])

  async function loadAll() {
    setLoading(true)
    const [{ data: recosData }, { data: scoresData }, { data: criteresData }] = await Promise.all([
      supabase.from('recommandations').select('*, criteres_audit(libelle)').eq('mission_id', missionId).order('date_maj', { ascending: false }),
      supabase.from('audit_scores').select('critere_id, score').eq('mission_id', missionId),
      supabase.from('criteres_audit').select('id, libelle'),
    ])
    setRecos(recosData || [])
    setScores(scoresData || [])
    setCriteres(criteresData || [])
    setLoading(false)
  }

  async function genererDepuisPointsCritiques() {
    setBusy(true)
    setMsg('')
    const critereMap = Object.fromEntries(criteres.map((c) => [c.id, c.libelle]))
    const dejaCouverts = new Set(recos.filter((r) => r.critere_id).map((r) => r.critere_id))
    const pointsCritiques = scores.filter((s) => s.score <= 2 && !dejaCouverts.has(s.critere_id))

    if (pointsCritiques.length === 0) {
      setMsg('Aucun nouveau point critique à traiter (soit tout est déjà couvert, soit aucun critère ≤2).')
      setBusy(false)
      return
    }

    const nouvelles = pointsCritiques.map((s) => ({
      mission_id: missionId,
      critere_id: s.critere_id,
      texte: `À traiter : ${critereMap[s.critere_id] || 'critère'} (noté ${s.score}/5)`,
      statut: 'non_entamee',
    }))

    const { error } = await supabase.from('recommandations').insert(nouvelles)
    setBusy(false)
    if (error) {
      setMsg('Erreur : ' + error.message)
    } else {
      setMsg(`${nouvelles.length} recommandation(s) générée(s).`)
      loadAll()
    }
  }

  async function ajouterManuelle() {
    if (!nouveauTexte.trim()) return
    setBusy(true)
    const { error } = await supabase.from('recommandations').insert({
      mission_id: missionId,
      texte: nouveauTexte.trim(),
      statut: 'non_entamee',
    })
    setBusy(false)
    if (!error) {
      setNouveauTexte('')
      loadAll()
    }
  }

  async function changerStatut(id, statut) {
    await supabase.from('recommandations').update({ statut, date_maj: new Date().toISOString().slice(0, 10) }).eq('id', id)
    setRecos((prev) => prev.map((r) => (r.id === id ? { ...r, statut } : r)))
  }

  async function supprimer(id) {
    await supabase.from('recommandations').delete().eq('id', id)
    setRecos((prev) => prev.filter((r) => r.id !== id))
  }

  if (loading) return <p style={{ fontSize: 13, color: '#666' }}>Chargement…</p>

  const compte = {
    non_entamee: recos.filter((r) => r.statut === 'non_entamee').length,
    en_cours: recos.filter((r) => r.statut === 'en_cours').length,
    realisee: recos.filter((r) => r.statut === 'realisee').length,
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {STATUTS.map((s) => (
          <div key={s.value} style={{ fontSize: 12 }}>
            <span style={{ color: s.color, fontWeight: 'bold' }}>{compte[s.value]}</span> {s.label}
          </div>
        ))}
      </div>

      <button
        onClick={genererDepuisPointsCritiques}
        disabled={busy}
        style={{ backgroundColor: NAVY, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13, marginBottom: 16 }}
      >
        Générer les recommandations à partir des points critiques (≤2/5)
      </button>
      {msg && <p style={{ fontSize: 12, color: '#666' }}>{msg}</p>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          placeholder="Ajouter une recommandation manuelle…"
          value={nouveauTexte}
          onChange={(e) => setNouveauTexte(e.target.value)}
          style={{ flex: 1, padding: 8, fontSize: 13, border: '1px solid #ccc', borderRadius: 6 }}
        />
        <button
          onClick={ajouterManuelle}
          disabled={busy}
          style={{ background: 'none', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          Ajouter
        </button>
      </div>

      {recos.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Aucune recommandation pour le moment.</p>}

      {recos.map((r) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ flex: 1, fontSize: 13 }}>{r.texte}</div>
          <select
            value={r.statut}
            onChange={(e) => changerStatut(r.id, e.target.value)}
            style={{ padding: 6, fontSize: 12, borderRadius: 6, border: '1px solid #ccc' }}
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button onClick={() => supprimer(r.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>
      ))}
    </div>
  )
}
