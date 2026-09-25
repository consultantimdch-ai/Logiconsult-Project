// src/components/DonneesProjet.jsx
//
// Saisie des indicateurs, jalons et lignes budgétaires du projet (tables éditables).
// Ces données alimenteront plus tard la génération du tableau de bord Excel.
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const th = { textAlign: 'left', padding: '6px 8px', fontSize: 11, backgroundColor: NAVY, color: '#fff' }
const inputCell = { width: '100%', padding: 5, fontSize: 12, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }
const addBtn = { background: 'none', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', marginTop: 6 }
const saveBtn = { backgroundColor: NAVY, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 12, marginTop: 10 }
const delBtn = { color: '#C0392B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }

export default function DonneesProjet({ missionId }) {
  return (
    <div>
      <IndicateursTable missionId={missionId} />
      <JalonsTable missionId={missionId} />
      <BudgetTable missionId={missionId} />
    </div>
  )
}

// ---------- Hook générique de table éditable ----------
function useEditableTable(table, missionId, emptyRow) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase.from(table).select('*').eq('mission_id', missionId).then(({ data }) => {
      setRows(data && data.length ? data : [])
      setLoading(false)
    })
  }, [missionId])

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow, id: 'new-' + Date.now() }])
  }

  function updateRow(id, field, value) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  async function deleteRow(id) {
    if (!String(id).startsWith('new-')) {
      await supabase.from(table).delete().eq('id', id)
    }
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  async function saveAll() {
    setSaving(true)
    setMsg('')
    const toUpsert = rows.map((r) => {
      const { id, ...rest } = r
      const row = { ...rest, mission_id: missionId }
      if (!String(id).startsWith('new-')) row.id = id
      return row
    })
    const { error } = await supabase.from(table).upsert(toUpsert)
    setSaving(false)
    setMsg(error ? 'Erreur : ' + error.message : 'Enregistré.')
    setTimeout(() => setMsg(''), 3000)
    if (!error) {
      const { data } = await supabase.from(table).select('*').eq('mission_id', missionId)
      setRows(data || [])
    }
  }

  return { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll }
}

// ---------- Indicateurs ----------
function IndicateursTable({ missionId }) {
  const empty = { resultat_axe: '', indicateur: '', unite: '', cible: '', valeur_actuelle: '', source_verification: '', frequence: '', responsable: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('indicateurs', missionId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ color: GOLD, fontSize: 14, marginBottom: 8 }}>Indicateurs</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Résultat/Axe</th><th style={th}>Indicateur</th><th style={th}>Unité</th>
            <th style={th}>Cible</th><th style={th}>Valeur actuelle</th><th style={th}>Source</th>
            <th style={th}>Fréquence</th><th style={th}>Responsable</th><th style={th}></th>
          </tr>
        </thead>
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

// ---------- Jalons ----------
function JalonsTable({ missionId }) {
  const empty = { libelle: '', date_prevue: '', date_reelle: '', avancement: '', commentaire: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('jalons', missionId, empty)
  if (loading) return null
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ color: GOLD, fontSize: 14, marginBottom: 8 }}>Jalons</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Jalon / Livrable</th><th style={th}>Date prévue</th><th style={th}>Date réelle</th>
            <th style={th}>% Avancement</th><th style={th}>Commentaire</th><th style={th}></th>
          </tr>
        </thead>
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

// ---------- Budget ----------
function BudgetTable({ missionId }) {
  const empty = { ligne: '', budget_prevu: '', depense_a_date: '' }
  const { rows, loading, saving, msg, addRow, updateRow, deleteRow, saveAll } = useEditableTable('budget_lignes', missionId, empty)
  if (loading) return null
  const totalPrevu = rows.reduce((a, r) => a + (Number(r.budget_prevu) || 0), 0)
  const totalDepense = rows.reduce((a, r) => a + (Number(r.depense_a_date) || 0), 0)
  return (
    <div style={{ marginBottom: 30 }}>
      <h3 style={{ color: GOLD, fontSize: 14, marginBottom: 8 }}>Budget</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>Ligne budgétaire</th><th style={th}>Budget prévu (FCFA)</th>
            <th style={th}>Dépensé à date (FCFA)</th><th style={th}></th>
          </tr>
        </thead>
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
          <tfoot>
            <tr style={{ fontWeight: 'bold', fontSize: 12 }}>
              <td style={{ padding: '6px 8px' }}>TOTAL</td>
              <td style={{ padding: '6px 8px' }}>{totalPrevu.toLocaleString('fr-FR')}</td>
              <td style={{ padding: '6px 8px' }}>{totalDepense.toLocaleString('fr-FR')}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </table>
      <button style={addBtn} onClick={addRow}>+ Ajouter une ligne budgétaire</button>{' '}
      <button style={saveBtn} onClick={saveAll} disabled={saving}>{saving ? '...' : 'Enregistrer le budget'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}
