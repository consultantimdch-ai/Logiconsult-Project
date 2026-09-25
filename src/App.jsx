// src/App.jsx
//
// Gère la navigation entre Dashboard, Nouvelle mission, et Détail mission.

import { useState } from 'react'
import Dashboard from './components/Dashboard'
import NewMission from './components/NewMission'
import MissionDetail from './components/MissionDetail'

export default function App() {
  const [screen, setScreen] = useState('dashboard') // 'dashboard' | 'new-mission' | 'mission-detail'
  const [selectedMissionId, setSelectedMissionId] = useState(null)

  function handleOpenMission(missionId) {
    setSelectedMissionId(missionId)
    setScreen('mission-detail')
  }

  function handleMissionCreated(missionId) {
    setSelectedMissionId(missionId)
    setScreen('mission-detail')
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
