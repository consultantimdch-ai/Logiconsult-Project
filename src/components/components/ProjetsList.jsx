// src/components/ProjetsList.jsx
//
// Liste des projets, tous clients confondus (avec le nom du client affiché),
// et création d'un nouveau projet. À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

export default function ProjetsList({ onOpenProjet }) {
  const [projets, setProjets] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clientMode, setClientMode] = useState('existing')
  const [clientId, setClientId] = useState('')
  const [nouveauNom, setNouveauNom] = useState('')
  const [nomProjet, setNomProjet] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const [{ data: projetsData }, { data: clientsData }] = await Promise.all([
      supabase.from('projets').select('*, clients(id, nom)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, nom').order('nom'),
    ])
    setProjets(projetsData || [])
    setClients(clientsData || [])
    setLoading(false)
  }

  async function creerProjet(e) {
    e.preventDefault()
    setError(null)
    if (!nomProjet.trim()) {
      setError('Le nom du projet est obligatoire.')
      return
    }
    setSaving(true)
    try {
      let finalClientId = clientId
      if (clientMode === 'new') {
        if (!nouveauNom.trim()) {
          setError("Le nom de l'organisation est obligatoire.")
          setSaving(false)
          return
        }
        const { data: newClient, error: clientErr } = await supabase
          .from('clients').insert({ nom: nouveauNom.trim() }).select().single()
        if (clientErr) throw clientErr
        finalClientId = newClient.id
      } else if (!clientId) {
        setError('Choisis un client, ou passe en mode "Nouveau client".')
        setSaving(false)
        return
      }

      const { data: projet, error: projetErr } = await supabase
        .from('projets').insert({ client_id: finalClientId, nom_projet: nomProjet.trim() }).select().single()
      if (projetErr) throw projetErr

      setShowForm(false)
      setNomProjet('')
      setNouveauNom('')
      setClientId('')
      onOpenProjet(projet.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#666', margin: 0 }}>
          Une organisation peut avoir plusieurs projets, indépendamment de ses missions d'audit.
        </p>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{ backgroundColor: NAVY, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}
        >
          + Nouveau projet
        </button>
      </div>

      {showForm && (
        <form onSubmit={creerProjet} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 20, maxWidth: 480 }}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ marginRight: 16, fontSize: 13 }}>
              <input type="radio" checked={clientMode === 'existing'} onChange={() => setClientMode('existing')} /> Organisation existante
            </label>
            <label style={{ fontSize: 13 }}>
              <input type="radio" checked={clientMode === 'new'} onChange={() => setClientMode('new')} /> Nouvelle organisation
            </label>
          </div>
          {clientMode === 'existing' ? (
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={inputStyle}>
              <option value="">— Choisir une organisation —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          ) : (
            <input placeholder="Nom de l'organisation" value={nouveauNom} onChange={(e) => setNouveauNom(e.target.value)} style={inputStyle} />
          )}
          <input placeholder="Nom du projet" value={nomProjet} onChange={(e) => setNomProjet(e.target.value)} style={inputStyle} />
          {error && <p style={{ color: '#C0392B', fontSize: 13 }}>{error}</p>}
          <button type="submit" disabled={saving} style={{ backgroundColor: GOLD, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}>
            {saving ? '...' : 'Créer le projet'}
          </button>
        </form>
      )}

      {loading && <p>Chargement…</p>}
      {!loading && projets.length === 0 && <p style={{ color: '#666', fontSize: 13 }}>Aucun projet pour le moment.</p>}

      {!loading && projets.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ backgroundColor: NAVY, color: '#fff' }}>
              <th style={thStyle}>Projet</th>
              <th style={thStyle}>Organisation</th>
              <th style={thStyle}>Bailleur</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {projets.map((p, i) => (
              <tr key={p.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#F3ECDD', cursor: 'pointer' }} onClick={() => onOpenProjet(p.id)}>
                <td style={tdStyle}><strong>{p.nom_projet}</strong></td>
                <td style={tdStyle}>{p.clients?.nom}</td>
                <td style={tdStyle}>{p.bailleur || '—'}</td>
                <td style={{ ...tdStyle, color: GOLD, fontWeight: 'bold' }}>Ouvrir →</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const inputStyle = { display: 'block', width: '100%', padding: 8, marginBottom: 10, border: '1px solid #ccc', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }
const thStyle = { textAlign: 'left', padding: '10px 12px', fontSize: 13 }
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #eee' }
