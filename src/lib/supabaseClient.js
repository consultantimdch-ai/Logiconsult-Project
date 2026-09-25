// src/lib/supabaseClient.js
//
// Connexion à Supabase — à coller tel quel dans ton projet.
// Nécessite le package "@supabase/supabase-js" (à ajouter dans les dépendances
// si ton environnement web permet d'ajouter des packages npm).
//
// Remplace les deux valeurs ci-dessous par celles de TON projet Supabase
// (Project Settings > API dans le tableau de bord Supabase).

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://apvkgbfpjafcdheeueyj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwdmtnYmZwamFmY2RoZWV1ZXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzgxODgsImV4cCI6MjEwNTgxNDE4OH0.sWVzK35tD2slF6i2GSLOfMBAD9FP4aRumjDODOPZehw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
