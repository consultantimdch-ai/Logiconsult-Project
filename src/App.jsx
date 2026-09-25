// src/App.jsx
//
// Gère la navigation entre le Dashboard et l'écran "Nouvelle mission".

import { useState } from 'react'
import Dashboard from './components/Dashboard'
import NewMission from './components/NewMission'

export default function App() {
  const [screen, setScreen] = useState('dashboard') // 'dashboard' | 'new-mission'

  function handleOpenMission(missionId) {
    alert('Écran "Détail mission" pas encore construit. Mission id : ' + missionId)
  }

  function handleMissionCreated(missionId) {
    alert('Mission créée avec succès ! (id : ' + missionId + ') — écran de détail à venir.')
    setScreen('dashboard')
  }

  if (screen === 'new-mission') {
    return (
      <NewMission
        onCancel={() => setScreen('dashboard')}
        onCreated={handleMissionCreated}
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
