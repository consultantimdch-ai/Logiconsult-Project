// src/components/FichesComplementaires.jsx
//
// Formulaires de données complémentaires par domaine (Projet / Financier / Organisationnel).
// Une ligne par mission dans chaque table (fiche_projet, fiche_financiere, fiche_organisationnelle).
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const inputStyle = {
  display: 'block', width: '100%', padding: '8px 10px', marginTop: 6, marginBottom: 14,
  border: '1px solid #ccc', borderRadius: 6, fontSize: 13, boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, fontWeight: 'bold', color: '#333' }
const sectionTitle = { color: GOLD, fontSize: 14, marginTop: 24, marginBottom: 8 }
const saveBtn = {
  backgroundColor: NAVY, color: '#fff', border: 'none', padding: '9px 18px',
  borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13, marginTop: 8,
}

export default function FichesComplementaires({ missionId, domaines }) {
  return (
    <div>
      {domaines.includes('financier') && <FicheFinanciereForm missionId={missionId} />}
      {domaines.includes('organisationnel') && <FicheOrganisationnelleForm missionId={missionId} />}
      {domaines.includes('strategique') && <FicheStrategiqueForm missionId={missionId} />}
    </div>
  )
}

// ---------------- Champ générique avec état + sauvegarde ----------------
function useFiche(table, missionId, emptyForm) {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    supabase
      .from(table)
      .select('*')
      .eq('mission_id', missionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ ...emptyForm, ...data })
        setLoading(false)
      })
  }, [missionId])

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function save() {
    setSaving(true)
    setMsg('')
    const { error } = await supabase
      .from(table)
      .upsert({ ...form, mission_id: missionId }, { onConflict: 'mission_id' })
    setSaving(false)
    setMsg(error ? 'Erreur : ' + error.message : 'Enregistré.')
    setTimeout(() => setMsg(''), 3000)
  }

  return { form, set, save, saving, msg, loading }
}

// ---------------- Fiche Financière ----------------
function FicheFinanciereForm({ missionId }) {
  const { form, set, save, saving, msg, loading } = useFiche('fiche_financiere', missionId, {
    nature_juridique: '', exercice_comptable: '', sources_financement: '',
    effectif_service_finance: '', logiciel_comptable: '', seuils_autorisation: '', banques_comptes: '',
  })
  if (loading) return null
  return (
    <div>
      <h3 style={sectionTitle}>Fiche financière</h3>
      <Field label="Nature juridique" value={form.nature_juridique} onChange={(v) => set('nature_juridique', v)} />
      <Field label="Exercice comptable" value={form.exercice_comptable} onChange={(v) => set('exercice_comptable', v)} placeholder="ex: 01/01 - 31/12" />
      <Field label="Sources de financement" textarea value={form.sources_financement} onChange={(v) => set('sources_financement', v)} />
      <Field label="Effectif du service finance/comptabilité" type="number" value={form.effectif_service_finance} onChange={(v) => set('effectif_service_finance', v)} />
      <Field label="Logiciel de comptabilité utilisé" value={form.logiciel_comptable} onChange={(v) => set('logiciel_comptable', v)} />
      <Field label="Seuils d'autorisation de dépense souhaités" textarea value={form.seuils_autorisation} onChange={(v) => set('seuils_autorisation', v)} />
      <Field label="Banques / comptes utilisés" value={form.banques_comptes} onChange={(v) => set('banques_comptes', v)} />
      <button style={saveBtn} onClick={save} disabled={saving}>{saving ? '...' : 'Enregistrer la fiche financière'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

// ---------------- Fiche Organisationnelle ----------------
function FicheOrganisationnelleForm({ missionId }) {
  const { form, set, save, saving, msg, loading } = useFiche('fiche_organisationnelle', missionId, {
    nature_juridique: '', effectif_total: '', statuts_existants: false,
    organigramme_existant: false, reglement_interieur_existant: false, structure_gouvernance: '',
  })
  if (loading) return null
  return (
    <div>
      <h3 style={sectionTitle}>Fiche organisationnelle</h3>
      <Field label="Nature juridique" value={form.nature_juridique} onChange={(v) => set('nature_juridique', v)} />
      <Field label="Effectif total" type="number" value={form.effectif_total} onChange={(v) => set('effectif_total', v)} />
      <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>
        <input type="checkbox" checked={!!form.statuts_existants} onChange={(e) => set('statuts_existants', e.target.checked)} /> Statuts existants
      </label>
      <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>
        <input type="checkbox" checked={!!form.organigramme_existant} onChange={(e) => set('organigramme_existant', e.target.checked)} /> Organigramme existant
      </label>
      <label style={{ ...labelStyle, display: 'block', marginBottom: 8 }}>
        <input type="checkbox" checked={!!form.reglement_interieur_existant} onChange={(e) => set('reglement_interieur_existant', e.target.checked)} /> Règlement intérieur existant
      </label>
      <Field label="Structure de gouvernance actuelle" textarea value={form.structure_gouvernance} onChange={(v) => set('structure_gouvernance', v)} />
      <button style={saveBtn} onClick={save} disabled={saving}>{saving ? '...' : 'Enregistrer la fiche organisationnelle'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

// ---------------- Fiche Stratégique ----------------
function FicheStrategiqueForm({ missionId }) {
  const { form, set, save, saving, msg, loading } = useFiche('fiche_strategique', missionId, {
    vision: '', mission_texte: '', valeurs: '', objectifs_strategiques: '',
    axes_strategiques: '', derniere_analyse_swot: '', prochaine_revue_strategique: '',
  })
  if (loading) return null
  return (
    <div>
      <h3 style={sectionTitle}>Fiche stratégique</h3>
      <Field label="Vision" textarea value={form.vision} onChange={(v) => set('vision', v)} />
      <Field label="Mission" textarea value={form.mission_texte} onChange={(v) => set('mission_texte', v)} />
      <Field label="Valeurs" textarea value={form.valeurs} onChange={(v) => set('valeurs', v)} />
      <Field label="Objectifs stratégiques (3-5 ans)" textarea value={form.objectifs_strategiques} onChange={(v) => set('objectifs_strategiques', v)} />
      <Field label="Axes stratégiques" textarea value={form.axes_strategiques} onChange={(v) => set('axes_strategiques', v)} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Field label="Dernière analyse SWOT" type="date" value={form.derniere_analyse_swot} onChange={(v) => set('derniere_analyse_swot', v)} />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Prochaine revue stratégique" type="date" value={form.prochaine_revue_strategique} onChange={(v) => set('prochaine_revue_strategique', v)} />
        </div>
      </div>
      <button style={saveBtn} onClick={save} disabled={saving}>{saving ? '...' : 'Enregistrer la fiche stratégique'}</button>
      {msg && <span style={{ marginLeft: 10, fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
    </div>
  )
}

// ---------------- Champ générique ----------------
function Field({ label, value, onChange, type = 'text', textarea, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
