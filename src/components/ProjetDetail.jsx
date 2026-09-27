// src/components/ProjetDetail.jsx
//
// Détail d'un projet : fiche d'identification, indicateurs, jalons, budget,
// risques, parties prenantes, et génération des documents associés.
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { genererTableauBordExcel } from '../lib/genererTableauBordExcel'
import { genererCadreLogique } from '../lib/genererCadreLogique'
import { genererPlanSuiviEvaluation } from '../lib/genererPlanSuiviEvaluation'
import { genererRegistreRisques } from '../lib/genererRegistreRisques'
import { genererPlanPartiesPrenantes } from '../lib/genererPlanPartiesPrenantes'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const inputStyle = { display: 'block', width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 14, border: '1px solid #ccc', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }
const labelStyle = { fontSize: 12, fontWeight: 'bold', color: '#333' }
const sectionTitle = { color: GOLD, fontSize: 14, marginTop: 24, marginBottom: 8 }
const saveBtn = { backgroundColor: NAVY, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13, marginTop: 8 }
const th = { textAlign: 'left', padding: '6px 8px', fontSize: 11, backgroundColor: NAVY, color: '#fff' }
const inputCell = { width: '100%', padding: 5, fontSize: 12, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }
const addBtn = { background: 'none', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', marginTop: 6 }
const delBtn = { color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }
const docBtn = { backgroundColor: GOLD, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }

export default function ProjetDetail({ projetId, onBack }) {
  const [projet, setProjet] = useState(null)
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingFiche, setSavingFiche] = useState(false)
  const [ficheMsg, setFicheMsg] = useState('')
  const [docMsg, setDocMsg] = useState('')
  const [docBusy, setDocBusy] = useState(false)

  useEffect(() => {
    supabase.from('projets').select('*, clients(*)').eq('id', projetId).single().then(({ data }) => {
      setProjet(data)
      setClient(data?.clients)
      setLoading(false)
    })
  }, [projetId])

  function set(field, value) {
    setProjet((prev) => ({ ...prev, [field]: value }))
  }

  async function saveFiche() {
    setSavingFiche(true)
    setFicheMsg('')
    const { id, clients, created_at, ...rest } = projet
    const { error } = await supabase.from('projets').update(rest).eq('id', projetId)
    setSavingFiche(false)
    setFicheMsg(error ? 'Erreur : ' + error.message : 'Enregistré.')
    setTimeout(() => setFicheMsg(''), 3000)
  }

  async function fetchToutesLesDonnees() {
    const [{ data: indicateurs }, { data: jalons }, { data: budget }, { data: risques }, { data: partiesPrenantes }] = await Promise.all([
      supabase.from('indicateurs').select('*').eq('projet_id', projetId),
      supabase.from('jalons').select('*').eq('projet_id', projetId),
      supabase.from('budget_lignes').select('*').eq('projet_id', projetId),
      supabase.from('risques').select('*').eq('projet_id', projetId),
      supabase.from('parties_prenantes').select('*').eq('projet_id', projetId),
    ])
    return { indicateurs, jalons, budget, risques, partiesPrenantes }
  }

  async function generer(fn, label, extra = {}) {
    setDocBusy(true)
    setDocMsg('')
    try {
      const donnees = await fetchToutesLesDonnees()
      await fn({ client, fiche: projet, ...donnees, ...extra })
      setDocMsg(`${label} téléchargé.`)
    } catch (err) {
      setDocMsg('Erreur : ' + err.message)
    } finally {
      setDocBusy(false)
      setTimeout(() => setDocMsg(''), 4000)
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Chargement…</div>
  if (!projet) return <div style={{ padding: 24 }}>Projet introuvable.</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px', fontFamily: 'Arial, sans-serif' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: GOLD, cursor: 'pointer', fontSize: 14, marginBottom: 12 }}>
        ← Retour aux projets
      </button>
      <h1 style={{ color: NAVY, fontSize: 22, fontWeight: 'bold', margin: 0 }}>{projet.nom_projet}</h1>
      <p style={{ color: '#666', fontSize: 13, margin: '4px 0 20px' }}>{client?.nom}</p>

      <h3 style={sectionTitle}>Fiche projet</h3>
      <Field label="Nom du projet" value={projet.nom_projet} onChange={(v) => set('nom_projet', v)} />
      <Field label="Bailleur / financement" value={projet.bailleur} onChange={(v) => set('bailleur', v)} />
      <Field label="Chef de projet" value={projet.chef_projet} onChange={(v) => set('chef_projet', v)} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}><Field label="Date de début" type="date" value={projet.date_debut} onChange={(v) => set('date_debut', v)} /></div>
        <div style={{ flex: 1 }}><Field label="Date de fin prévue" type="date" value={projet.date_fin_prevue} onChange={(v) => set('date_fin_prevue', v)} /></div>
      </div>
      <Field label="Objectif global" textarea value={projet.objectif_global} onChange={(v) => set('objectif_global', v)} />
      <Field label="Objectifs spécifiques" textarea value={projet.objectifs_specifiques} onChange={(v) => set('objectifs_specifiques', v)} />
      <Field label="Zone d'intervention" value={projet.zone_intervention} onChange={(v) => set('zone_intervention', v)} />
      <button style={saveBtn} onClick={saveFiche} disabled={savingFiche}>{savingFiche ? '...' : 'Enregistrer la fiche'}</button>
      {ficheMsg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{ficheMsg}</span>}

      <IndicateursTable projetId={projetId} />
      <JalonsTable projetId={projetId} />
      <BudgetTable projetId={projetId} />
      <RisquesTable projetId={projetId} />
      <PartiesPrenantesTable projetId={projetId} />

      <h3 style={sectionTitle}>Documents générables</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button style={docBtn} disabled={docBusy} onClick={() => generer(genererTableauBordExcel, 'Tableau de bord')}>Tableau de bord (Excel)</button>
        <button style={docBtn} disabled={docBusy} onClick={() => generer(genererCadreLogique, 'Cadre logique')}>Cadre logique (Excel)</button>
        <button style={docBtn} disabled={docBusy} onClick={() => generer(genererPlanSuiviEvaluation, 'Plan de suivi-évaluation')}>Plan S&amp;E (Excel)</button>
        <button style={docBtn} disabled={docBusy} onClick={() => generer(genererRegistreRisques, 'Registre des risques')}>Registre des risques (Excel)</button>
        <button style={docBtn} disabled={docBusy} onClick={() => generer(genererPlanPartiesPrenantes, 'Plan parties prenantes')}>Plan parties prenantes (Excel)</button>
      </div>
      {docMsg && <p style={{ fontSize: 12, color: docMsg.startsWith('Erreur') ? '#C0392B' : '#2E7D32', marginTop: 10 }}>{docMsg}</p>}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', textarea }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
      )}
    </div>
  )
}

// ---------- Hook générique de table éditable (par projet_id) ----------
function useEditableTable(table, projetId, emptyRow) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from(table).select('*').eq('projet_id', projetId).then(({ data }) => {
      setRows(data && data.length ? data : [])
      setLoading(false)
    })
  }, [projetId])

  function addRow() { setRows((prev) => [...prev, { ...emptyRow, id: 'new-' + Date.now() }]) }
  function updateRow(id, field, value) { setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))) }
  async function deleteRow(id) {
    if (!String(id).startsWith('new-')) await supabase.from(table).delete().eq('id', id)
    setRows((prev) => prev.filter((r) => r.id !== id))
  }
  async function saveAll() {
    setSaving(true)
    setMsg('')
    const toUpsert = rows.map((r) => {
      const { id, ...rest } = r
      const row = { ...rest, projet_id: projetId }
      if (!String(id).startsWith('new-')) row.id = id
      return row
    })
    const { error } = await supabase.from(table).upsert(toUpsert)
    setSaving(false)
    setMsg(error ? 'Erreur : ' + error.message : 'Enregistré.')
    setTimeout(() => setMsg(''), 3000)
    if (!error) {
      const { data } = await supabase.from(table).select('*').eq('projet_id', projetId)
      setRows(data || [])
    }
  }
  return { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll }
}

function IndicateursTable({ projetId }) {
  const empty = { resultat_axe: '', indicateur: '', unite: '', cible: '', valeur_actuelle: '', source_verification: '', frequence: '', responsable: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('indicateurs', projetId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={sectionTitle}>Indicateurs</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Résultat/Axe</th><th style={th}>Indicateur</th><th style={th}>Unité</th>
          <th style={th}>Cible</th><th style={th}>Valeur actuelle</th><th style={th}>Source</th>
          <th style={th}>Fréquence</th><th style={th}>Responsable</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input style={inputCell} value={r.resultat_axe || ''} onChange={(e) => updateRow(r.id, 'resultat_axe', e.target.value)} /></td>
              <td><input style={inputCell} value={r.indicateur || ''} onChange={(e) => updateRow(r.id, 'indicateur', e.target.value)} /></td>
              <td><input style={inputCell} value={r.unite || ''} onChange={(e) => updateRow(r.id, 'unite', e.target.value)} /></td>
              <td><input style={inputCell} type="number" value={r.cible || ''} onChange={(e) => updateRow(r.id, 'cible', e.target.value)} /></td>
              <td><input style={inputCell} type="number" value={r.valeur_actuelle || ''} onChange={(e) => updateRow(r.id, 'valeur_actuelle', e.target.value)} /></td>
              <td><input style={inputCell} value={r.source_verification || ''} onChange={(e) => updateRow(r.id, 'source_verification', e.target.value)} /></td>
              <td><input style={inputCell} value={r.frequence || ''} onChange={(e) => updateRow(r.id, 'frequence', e.target.value)} /></td>
              <td><input style={inputCell} value={r.responsable || ''} onChange={(e) => updateRow(r.id, 'responsable', e.target.value)} /></td>
              <td><button style={delBtn} onClick={() => deleteRow(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter un indicateur</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer les indicateurs'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

function JalonsTable({ projetId }) {
  const empty = { libelle: '', date_prevue: '', date_reelle: '', avancement: '', commentaire: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('jalons', projetId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={sectionTitle}>Jalons</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Jalon / Livrable</th><th style={th}>Date prévue</th><th style={th}>Date réelle</th>
          <th style={th}>% Avancement</th><th style={th}>Commentaire</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input style={inputCell} value={r.libelle || ''} onChange={(e) => updateRow(r.id, 'libelle', e.target.value)} /></td>
              <td><input style={inputCell} type="date" value={r.date_prevue || ''} onChange={(e) => updateRow(r.id, 'date_prevue', e.target.value)} /></td>
              <td><input style={inputCell} type="date" value={r.date_reelle || ''} onChange={(e) => updateRow(r.id, 'date_reelle', e.target.value)} /></td>
              <td><input style={inputCell} type="number" min="0" max="100" value={r.avancement || ''} onChange={(e) => updateRow(r.id, 'avancement', e.target.value)} /></td>
              <td><input style={inputCell} value={r.commentaire || ''} onChange={(e) => updateRow(r.id, 'commentaire', e.target.value)} /></td>
              <td><button style={delBtn} onClick={() => deleteRow(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter un jalon</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer les jalons'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

function BudgetTable({ projetId }) {
  const empty = { ligne: '', budget_prevu: '', depense_a_date: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('budget_lignes', projetId, empty)
  if (loading) return null
  const totalPrevu = rows.reduce((a, r) => a + (Number(r.budget_prevu) || 0), 0)
  const totalDepense = rows.reduce((a, r) => a + (Number(r.depense_a_date) || 0), 0)
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={sectionTitle}>Budget</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Ligne budgétaire</th><th style={th}>Budget prévu (FCFA)</th><th style={th}>Dépensé à date (FCFA)</th><th style={th}></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input style={inputCell} value={r.ligne || ''} onChange={(e) => updateRow(r.id, 'ligne', e.target.value)} /></td>
              <td><input style={inputCell} type="number" value={r.budget_prevu || ''} onChange={(e) => updateRow(r.id, 'budget_prevu', e.target.value)} /></td>
              <td><input style={inputCell} type="number" value={r.depense_a_date || ''} onChange={(e) => updateRow(r.id, 'depense_a_date', e.target.value)} /></td>
              <td><button style={delBtn} onClick={() => deleteRow(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
        {rows.length > 0 && (
          <tfoot><tr style={{ fontWeight: 'bold', fontSize: 12 }}>
            <td style={{ padding: '6px 8px' }}>TOTAL</td>
            <td style={{ padding: '6px 8px' }}>{totalPrevu.toLocaleString('fr-FR')}</td>
            <td style={{ padding: '6px 8px' }}>{totalDepense.toLocaleString('fr-FR')}</td>
            <td></td>
          </tr></tfoot>
        )}
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter une ligne budgétaire</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer le budget'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

function RisquesTable({ projetId }) {
  const empty = { risque: '', categorie: '', probabilite: '', impact: '', mitigation: '', responsable: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('risques', projetId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={sectionTitle}>Risques</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Risque</th><th style={th}>Catégorie</th><th style={th}>Probabilité (1-4)</th>
          <th style={th}>Impact (1-4)</th><th style={th}>Mitigation</th><th style={th}>Responsable</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input style={inputCell} value={r.risque || ''} onChange={(e) => updateRow(r.id, 'risque', e.target.value)} /></td>
              <td><input style={inputCell} value={r.categorie || ''} onChange={(e) => updateRow(r.id, 'categorie', e.target.value)} /></td>
              <td><input style={inputCell} type="number" min="1" max="4" value={r.probabilite || ''} onChange={(e) => updateRow(r.id, 'probabilite', e.target.value)} /></td>
              <td><input style={inputCell} type="number" min="1" max="4" value={r.impact || ''} onChange={(e) => updateRow(r.id, 'impact', e.target.value)} /></td>
              <td><input style={inputCell} value={r.mitigation || ''} onChange={(e) => updateRow(r.id, 'mitigation', e.target.value)} /></td>
              <td><input style={inputCell} value={r.responsable || ''} onChange={(e) => updateRow(r.id, 'responsable', e.target.value)} /></td>
              <td><button style={delBtn} onClick={() => deleteRow(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter un risque</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer les risques'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

function PartiesPrenantesTable({ projetId }) {
  const empty = { nom: '', enjeu: '', influence: '', interet: '', strategie_communication: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('parties_prenantes', projetId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={sectionTitle}>Parties prenantes</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>
          <th style={th}>Partie prenante</th><th style={th}>Enjeu</th><th style={th}>Influence</th>
          <th style={th}>Intérêt</th><th style={th}>Stratégie de communication</th><th style={th}></th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><input style={inputCell} value={r.nom || ''} onChange={(e) => updateRow(r.id, 'nom', e.target.value)} /></td>
              <td><input style={inputCell} value={r.enjeu || ''} onChange={(e) => updateRow(r.id, 'enjeu', e.target.value)} /></td>
              <td><input style={inputCell} value={r.influence || ''} onChange={(e) => updateRow(r.id, 'influence', e.target.value)} /></td>
              <td><input style={inputCell} value={r.interet || ''} onChange={(e) => updateRow(r.id, 'interet', e.target.value)} /></td>
              <td><input style={inputCell} value={r.strategie_communication || ''} onChange={(e) => updateRow(r.id, 'strategie_communication', e.target.value)} /></td>
              <td><button style={delBtn} onClick={() => deleteRow(r.id)}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter une partie prenante</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer les parties prenantes'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}
