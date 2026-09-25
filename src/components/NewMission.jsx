// src/components/NewMission.jsx
//
// Écran "Nouvelle mission" : choix/création du client + sélection des domaines.
// À coller dans ton projet.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const DOMAINES = [
  { value: 'projet', label: 'Gestion de projet' },
  { value: 'financier', label: 'Gestion financière' },
  { value: 'organisationnel', label: 'Gestion organisationnelle' },
]

export default function NewMission({ onCancel, onCreated }) {
  const [clients, setClients] = useState([])
  const [clientMode, setClientMode] = useState('existing') // 'existing' | 'new'
  const [clientId, setClientId] = useState('')
  const [nouveauNom, setNouveauNom] = useState('')
  const [nouveauSecteur, setNouveauSecteur] = useState('')
  const [nouvelleNatureJuridique, setNouvelleNatureJuridique] = useState('')
  const [dateMission, setDateMission] = useState(() => new Date().toISOString().slice(0, 10))
  const [domainesChoisis, setDomainesChoisis] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('clients')
      .select('id, nom, secteur_activite')
      .order('nom')
      .then(({ data, error }) => {
        if (!error) setClients(data)
      })
  }, [])

  function toggleDomaine(value) {
    setDomainesChoisis((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (domainesChoisis.length === 0) {
      setError('Sélectionne au moins un domaine à auditer.')
      return
    }
    if (clientMode === 'existing' && !clientId) {
      setError('Choisis un client existant, ou passe en mode "Nouveau client".')
      return
    }
    if (clientMode === 'new' && !nouveauNom.trim()) {
      setError("Le nom de l'organisation est obligatoire.")
      return
    }

    setSaving(true)
    try {
      let finalClientId = clientId

      if (clientMode === 'new') {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            nom: nouveauNom.trim(),
            secteur_activite: nouveauSecteur.trim() || null,
            nature_juridique: nouvelleNatureJuridique.trim() || null,
          })
          .select()
          .single()

        if (clientError) throw clientError
        finalClientId = newClient.id
      }

      const { data: mission, error: missionError } = await supabase
        .from('missions')
        .insert({
          client_id: finalClientId,
          date_mission: dateMission,
          domaines: domainesChoisis,
          statut: 'en_cours',
        })
        .select()
        .single()

      if (missionError) throw missionError

      onCreated(mission.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 'bold' }}>Nouvelle mission</h1>

      <form onSubmit={handleSubmit}>
        {/* ---- Client ---- */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Organisation cliente</legend>

          <label style={radioLabel}>
            <input
              type="radio"
              checked={clientMode === 'existing'}
              onChange={() => setClientMode('existing')}
            />{' '}
            Client existant
          </label>
          <label style={radioLabel}>
            <input
              type="radio"
              checked={clientMode === 'new'}
              onChange={() => setClientMode('new')}
            />{' '}
            Nouveau client
          </label>

          {clientMode === 'existing' && (
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={inputStyle}
            >
              <option value="">— Choisir un client —</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} {c.secteur_activite ? `(${c.secteur_activite})` : ''}
                </option>
              ))}
            </select>
          )}

          {clientMode === 'new' && (
            <>
              <input
                placeholder="Nom de l'organisation *"
                value={nouveauNom}
                onChange={(e) => setNouveauNom(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Secteur d'activité"
                value={nouveauSecteur}
                onChange={(e) => setNouveauSecteur(e.target.value)}
                style={inputStyle}
              />
              <input
                placeholder="Nature juridique (ONG, SARL, association...)"
                value={nouvelleNatureJuridique}
                onChange={(e) => setNouvelleNatureJuridique(e.target.value)}
                style={inputStyle}
              />
            </>
          )}
        </fieldset>

        {/* ---- Date ---- */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Date de la mission</legend>
          <input
            type="date"
            value={dateMission}
            onChange={(e) => setDateMission(e.target.value)}
            style={inputStyle}
          />
        </fieldset>

        {/* ---- Domaines ---- */}
        <fieldset style={fieldsetStyle}>
          <legend style={legendStyle}>Domaines à auditer</legend>
          {DOMAINES.map((d) => (
            <label key={d.value} style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={domainesChoisis.includes(d.value)}
                onChange={() => toggleDomaine(d.value)}
              />{' '}
              {d.label}
            </label>
          ))}
        </fieldset>

        {error && <p style={{ color: '#c0392b', fontSize: 14 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ ...btnStyle, backgroundColor: '#eee', color: '#333' }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{ ...btnStyle, backgroundColor: NAVY, color: '#fff' }}
          >
            {saving ? 'Création…' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </div>
  )
}

const fieldsetStyle = { border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }
const legendStyle = { fontWeight: 'bold', color: GOLD, fontSize: 13, padding: '0 6px' }
const radioLabel = { marginRight: 20, fontSize: 14 }
const inputStyle = {
  display: 'block', width: '100%', padding: '8px 10px', marginTop: 10,
  border: '1px solid #ccc', borderRadius: 6, fontSize: 14, boxSizing: 'border-box',
}
const btnStyle = {
  border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 'bold',
  cursor: 'pointer', fontSize: 14,
}
