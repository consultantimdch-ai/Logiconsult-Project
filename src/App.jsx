// src/App.jsx
//
// Version provisoire : affiche uniquement le Dashboard.
// Les écrans "Nouvelle mission" et "Détail mission" viendront remplacer
// les alert() ci-dessous au fur et à mesure qu'on les construit.

import Dashboard from './components/Dashboard'

export default function App() {
  function handleOpenMission(missionId) {
    alert('Écran "Détail mission" pas encore construit. Mission id : ' + missionId)
  }

  function handleNewMission() {
    alert('Écran "Nouvelle mission" pas encore construit.')
  }

  return (
    <Dashboard
      onOpenMission={handleOpenMission}
      onNewMission={handleNewMission}
    />
  )
}
