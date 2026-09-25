// src/components/PropositionCommerciale.jsx
//
// Génère un brouillon de proposition commerciale de mission de suivi,
// à partir des points critiques détectés lors de l'audit.
// Je n'ai pas les tarifs exacts de ta grille Méthode IMD : les champs
// "nombre de jours" et "taux journalier" sont donc à ajuster toi-même,
// ils ne sont pas pré-remplis avec de vrais tarifs.
// À coller dans src/components/.

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const NAVY = '#1B2A4A'
const GOLD = '#B08D3E'

const DOMAINE_LABELS = {
  projet: 'Gestion de projet',
  financier: 'Gestion financière',
  organisationnel: 'Gestion organisationnelle',
}

export default function PropositionCommerciale({ mission, criteresActuels, scoresActuels }) {
  const [jours, setJours] = useState(5)
  const [tauxJournalier, setTauxJournalier] = useState(0)
  const [texte, setTexte] = useState('')
  const [statut, setStatut] = useState('brouillon')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const pointsCritiques = criteresActuels
    .map((c) => ({ ...c, score: scoresActuels[c.id]?.score }))
    .filter((c) => c.score !== '' && c.score !== undefined && Number(c.score) <= 2)

  const domainesConcernes = [...new Set(pointsCritiques.map((c) => c.domaine))]
  const montant = jours * tauxJournalier

  useEffect(() => {
    if (texte) return // ne pas écraser un texte déjà édité manuellement
    genererTexte()
  }, [pointsCritiques.length])

  function genererTexte() {
    if (pointsCritiques.length === 0) {
      setTexte("Aucun point critique identifié lors de l'audit — pas de mission de suivi à proposer pour le moment.")
      return
    }
    const listePoints = pointsCritiques.map((c) => `- ${c.libelle} (noté ${c.score}/5)`).join('\n')
    const domainesTxt = domainesConcernes.map((d) => DOMAINE_LABELS[d]).join(', ')

    setTexte(
`Suite à l'audit réalisé, ${pointsCritiques.length} point(s) critique(s) ont été identifiés dans le(s) domaine(s) suivant(s) : ${domainesTxt}.

Points concernés :
${listePoints}

Nous proposons une mission de suivi et d'accompagnement à la mise en œuvre des recommandations associées, afin de consolider durablement ces axes de progrès.

Durée estimée : ${jours} jour(s) de mission.
Montant proposé : ${montant.toLocaleString('fr-FR')} FCFA.`
    )
  }

  async function enregistrer() {
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('propositions_commerciales').insert({
      mission_id: mission.id,
      domaines_cibles: domainesConcernes,
      points_faibles_source: pointsCritiques.map((c) => c.libelle).join(' | '),
      montant_fcfa: montant,
      statut,
    })
    setSaving(false)
    setMsg(error ? 'Erreur : ' + error.message : 'Proposition enregistrée.')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div>
      <h2 style={{ color: NAVY, fontSize: 16, marginBottom: 6 }}>Proposition commerciale — mission de suivi</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        {pointsCritiques.length} point(s) critique(s) détecté(s) sur cette mission.
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 'bold' }}>Nombre de jours</label>
          <input
            type="number" min="1" value={jours}
            onChange={(e) => setJours(Number(e.target.value))}
            style={{ display: 'block', width: 100, padding: 6, marginTop: 4, border: '1px solid #ccc', borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 'bold' }}>Taux journalier (FCFA)</label>
          <input
            type="number" min="0" value={tauxJournalier}
            onChange={(e) => setTauxJournalier(Number(e.target.value))}
            style={{ display: 'block', width: 160, padding: 6, marginTop: 4, border: '1px solid #ccc', borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 'bold' }}>Montant total</label>
          <div style={{ marginTop: 4, fontWeight: 'bold', color: GOLD, fontSize: 16 }}>
            {montant.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      <button
        onClick={genererTexte}
        style={{ background: 'none', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: 6, padding: '7px 14px', fontSize: 12, cursor: 'pointer', marginBottom: 10 }}
      >
        Régénérer le texte à partir des points critiques
      </button>

      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={12}
        style={{ width: '100%', padding: 12, fontSize: 13, border: '1px solid #ccc', borderRadius: 6, boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
      />

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <select value={statut} onChange={(e) => setStatut(e.target.value)} style={{ padding: 6, fontSize: 12, borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="brouillon">Brouillon</option>
          <option value="envoyee">Envoyée</option>
          <option value="acceptee">Acceptée</option>
          <option value="refusee">Refusée</option>
        </select>
        <button
          onClick={enregistrer}
          disabled={saving}
          style={{ backgroundColor: NAVY, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }}
        >
          {saving ? '...' : 'Enregistrer la proposition'}
        </button>
        {msg && <span style={{ fontSize: 12, color: '#2E7D32' }}>{msg}</span>}
      </div>

      <p style={{ fontSize: 11, color: '#999', marginTop: 10 }}>
        Le texte ci-dessus est un brouillon généré automatiquement — à relire et personnaliser avant envoi.
        Pour l'instant, il se copie-colle manuellement (l'export direct en Word viendra avec le module de génération de documents).
      </p>
    </div>
  )
}
