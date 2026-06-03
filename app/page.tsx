'use client'
import { useState, useEffect, useCallback } from 'react'
import { Member, Meal, MealComment, WeightEntry, Workout } from '@/lib/supabase'
import HomeTab from '@/components/HomeTab'
import FoodTab from '@/components/FoodTab'
import WeightTab from '@/components/WeightTab'
import WorkoutTab from '@/components/WorkoutTab'
import SettingsTab from '@/components/SettingsTab'

export type WorkoutComment = {
  id: string
  workout_id: string
  member_name: string
  text: string
  created_at: string
}

export type AppData = {
  members: Member[]
  meals: Meal[]
  comments: MealComment[]
  weights: WeightEntry[]
  workouts: Workout[]
  workoutComments: WorkoutComment[]
}

type Tab = 'home' | 'food' | 'weight' | 'workout' | 'settings'

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [data, setData] = useState<AppData>({ members: [], meals: [], comments: [], weights: [], workouts: [], workoutComments: [] })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const loadAll = useCallback(async () => {
    try {
      const [members, meals, comments, weights, workouts, workoutComments] = await Promise.all([
        fetch('/api/members').then(r => r.json()),
        fetch('/api/meals').then(r => r.json()),
        fetch('/api/comments').then(r => r.json()),
        fetch('/api/weights').then(r => r.json()),
        fetch('/api/workouts').then(r => r.json()),
        fetch('/api/workout-comments').then(r => r.json()),
      ])
      setData({
        members: Array.isArray(members) ? members : [],
        meals: Array.isArray(meals) ? meals : [],
        comments: Array.isArray(comments) ? comments : [],
        weights: Array.isArray(weights) ? weights : [],
        workouts: Array.isArray(workouts) ? workouts : [],
        workoutComments: Array.isArray(workoutComments) ? workoutComments : [],
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'ti-home', label: 'Home' },
    { id: 'food', icon: 'ti-salad', label: 'Food' },
    { id: 'weight', icon: 'ti-weight', label: 'Weight' },
    { id: 'workout', icon: 'ti-barbell', label: 'Workout' },
    { id: 'settings', icon: 'ti-users', label: 'Family' },
  ]

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 80, minHeight: '100vh' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--nav)', color: '#fff', padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 12 }}>
          <span style={{ fontSize: 24 }}>🏋️</span>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: '#fff' }}>FamilyFit</h1>
        </div>
        <div className="nav-tab-bar" style={{ display: 'flex', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: 1, minWidth: 0, textAlign: 'center', padding: '8px 4px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none',
              color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,.5)',
              borderBottom: activeTab === t.id ? '2px solid #4ade80' : '2px solid transparent',
              whiteSpace: 'nowrap', transition: 'all .2s', fontFamily: 'inherit',
            }}>
              <i className={`ti ${t.icon}`} style={{ display: 'block', fontSize: 18, marginBottom: 2 }} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text3)' }}>
          <i className="ti ti-loader spin" style={{ fontSize: 32 }} />
          <p style={{ marginTop: 8 }}>Loading FamilyFit...</p>
        </div>
      ) : (
        <div className="fade-in">
          {activeTab === 'home' && <HomeTab data={data} />}
          {activeTab === 'food' && <FoodTab data={data} reload={loadAll} showToast={showToast} />}
          {activeTab === 'weight' && <WeightTab data={data} reload={loadAll} showToast={showToast} />}
          {activeTab === 'workout' && <WorkoutTab data={data} reload={loadAll} showToast={showToast} />}
          {activeTab === 'settings' && <SettingsTab data={data} reload={loadAll} showToast={showToast} />}
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1916', color: '#fff', padding: '10px 20px',
          borderRadius: 20, fontSize: 14, fontWeight: 500, zIndex: 300,
          animation: 'fadeInUp .3s ease', whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </div>
  )
}
