// src/App.jsx
//
// Gère la session (connexion requise) puis la navigation entre Dashboard,
// Nouvelle mission, et Détail mission.

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import NewMission from './components/NewMission'
import MissionDetail from './components/MissionDetail'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = chargement, null = non connecté
  const [screen, setScreen] = useState('dashboard') // 'dashboard' | 'new-mission' | 'mission-detail'
  const [selectedMissionId, setSelectedMissionId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleOpenMission(missionId) {
    setSelectedMissionId(missionId)
    setScreen('mission-detail')
  }

  function handleMissionCreated(missionId) {
    setSelectedMissionId(missionId)
    setScreen('mission-detail')
  }

  if (session === undefined) {
    return <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>Chargement…</div>
  }

  if (!session) {
    return <Login />
  }

  if (screen === 'new-mission') {
    return (
      <NewMission
        onCancel={() => setScreen('dashboard')}
        onCreated={handleMissionCreated}
      />
    )
  }

  if (screen === 'mission-detail') {
    return (
      <MissionDetail
        missionId={selectedMissionId}
        onBack={() => setScreen('dashboard')}
      />
    )
  }

  return (
    <Dashboard
      onOpenMission={handleOpenMission}
      onNewMission={() => setScreen('new-mission')}
    />
  )
}
