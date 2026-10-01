// src/components/Recommandations.jsx
//
// Suivi des recommandations : génération automatique à partir des critères notés ≤2,
// priorisation (gravité × facilité), responsable, échéance, ajout manuel, suivi de statut.
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { RECOMMANDATIONS_PAR_NUMERO, recommandationParDefaut } from '../lib/recommandationsTemplates'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const STATUTS = [
  { value: 'non_entamee', label: 'Non entamée', color: '#C0392B' },
  { value: 'en_cours', label: 'En cours', color: '#B08D3E' },
  { value: 'realisee', label: 'Réalisée', color: '#2E7D32' },
]

const FACILITES = [
  { value: '', label: 'Facilité ?' },
  { value: 1, label: '1 · Difficile / long' },
  { value: 2, label: '2 · Plutôt difficile' },
  { value: 3, label: '3 · Plutôt facile' },
  { value: 4, label: '4 · Facile / rapide' },
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

  function graviteDe(r) {
    if (!r.critere_id) return null
    const s = scores.find((sc) => sc.critere_id === r.critere_id)
    if (!s || s.score === null || s.score === undefined) return null
    return 5 - Number(s.score) // score 1 -> gravité 4 ; score 2 -> gravité 3
  }

  function prioriteDe(r) {
    const g = graviteDe(r)
    if (g === null || !r.facilite) return null
    return g * r.facilite
  }

  async function genererDepuisPointsCritiques() {
    setBusy(true)
    setMsg('')
    const critereMap = Object.fromEntries(criteres.map((c) => [c.id, c]))
    const dejaCouverts = new Set(recos.filter((r) => r.critere_id).map((r) => r.critere_id))
    const pointsCritiques = scores.filter((s) => s.score <= 2 && !dejaCouverts.has(s.critere_id))

    if (pointsCritiques.length === 0) {
      setMsg('Aucun nouveau point critique à traiter (soit tout est déjà couvert, soit aucun critère ≤2).')
      setBusy(false)
      return
    }

    const nouvelles = pointsCritiques.map((s) => {
      const critere = critereMap[s.critere_id]
      const texte = critere
        ? (RECOMMANDATIONS_PAR_NUMERO[critere.numero] || recommandationParDefaut(critere.libelle))
        : 'Point à traiter.'
      return {
        mission_id: missionId,
        critere_id: s.critere_id,
        texte,
        statut: 'non_entamee',
      }
    })

    const { error } = await supabase.from('recommandations').insert(nouvelles)
    setBusy(false)
    if (error) {
      setMsg('Erreur : ' + error.message)
    } else {
      setMsg(`${nouvelles.length} recommandation(s) générée(s). Renseigne la "facilité" de chacune pour calculer leur priorité.`)
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

  async function majChamp(id, champ, valeur) {
    await supabase.from('recommandations').update({ [champ]: valeur, date_maj: new Date().toISOString().slice(0, 10) }).eq('id', id)
    setRecos((prev) => prev.map((r) => (r.id === id ? { ...r, [champ]: valeur } : r)))
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

  // Tri par priorité décroissante (celles sans priorité calculable restent en bas)
  const recosTriees = [...recos].sort((a, b) => {
    const pa = prioriteDe(a)
    const pb = prioriteDe(b)
    if (pa === null && pb === null) return 0
    if (pa === null) return 1
    if (pb === null) return -1
    return pb - pa
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {STATUTS.map((s) => (
          <div key={s.value} style={{ fontSize: 12 }}>
            <span style={{ color: s.color, fontWeight: 'bold' }}>{compte[s.value]}</span> {s.label}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
        Priorité = gravité (issue du score d'audit) × facilité de mise en œuvre (à renseigner). Les recommandations
        les plus prioritaires (fort impact, facile à mettre en œuvre) remontent automatiquement en haut de liste.
      </p>

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

      {recosTriees.length === 0 && <p style={{ fontSize: 13, color: '#666' }}>Aucune recommandation pour le moment.</p>}

      {recosTriees.map((r) => {
        const priorite = prioriteDe(r)
        return (
          <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {priorite !== null && (
                <span style={{
                  minWidth: 28, textAlign: 'center', fontWeight: 'bold', fontSize: 12,
                  color: '#fff', backgroundColor: priorite >= 9 ? '#C0392B' : priorite >= 4 ? GOLD : '#999',
                  borderRadius: 4, padding: '2px 6px',
                }}>
                  {priorite}
                </span>
              )}
              <div style={{ flex: 1, fontSize: 13 }}>{r.texte}</div>
              <select
                value={r.statut}
                onChange={(e) => majChamp(r.id, 'statut', e.target.value)}
                style={{ padding: 6, fontSize: 12, borderRadius: 6, border: '1px solid #ccc' }}
              >
                {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <button onClick={() => supprimer(r.id)} style={{ color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, marginLeft: priorite !== null ? 38 : 0 }}>
              <select
                value={r.facilite || ''}
                onChange={(e) => majChamp(r.id, 'facilite', e.target.value ? Number(e.target.value) : null)}
                style={{ padding: 5, fontSize: 11, borderRadius: 6, border: '1px solid #ccc' }}
              >
                {FACILITES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <input
                placeholder="Responsable"
                value={r.responsable || ''}
                onChange={(e) => majChamp(r.id, 'responsable', e.target.value)}
                style={{ padding: 5, fontSize: 11, borderRadius: 6, border: '1px solid #ccc', width: 140 }}
              />
              <input
                type="date"
                value={r.echeance || ''}
                onChange={(e) => majChamp(r.id, 'echeance', e.target.value)}
                style={{ padding: 5, fontSize: 11, borderRadius: 6, border: '1px solid #ccc' }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
