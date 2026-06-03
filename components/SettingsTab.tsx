'use client'
import React, { useState } from 'react'
import { AppData } from '@/app/page'
import { Avatar, Card, Btn, FormGroup, inputStyle } from './ui'
import { getMemberColor, MEMBER_COLORS } from '@/lib/utils'

type Props = { data: AppData; reload: () => void; showToast: (m: string) => void }

export default function SettingsTab({ data, reload, showToast }: Props) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(MEMBER_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [editCals, setEditCals] = useState('')

  async function addMember() {
    if (!newName.trim()) return showToast('Enter a name')
    if (data.members.some(m => m.name === newName.trim())) return showToast('Already in the list')
    await fetch('/api/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim(), color: newColor, maintenance_calories: 2000 }) })
    setNewName('')
    showToast(`${newName} added! 👋`)
    reload()
  }

  async function removeMember(id: string, name: string) {
    if (!confirm(`Remove ${name} from the family list?`)) return
    await fetch(`/api/members?id=${id}`, { method: 'DELETE' })
    showToast(`${name} removed`)
    reload()
  }

  function startEdit(mem: typeof data.members[0]) {
    setEditingId(mem.id)
    setEditName(mem.name)
    setEditColor(mem.color)
    setEditCals(String(mem.maintenance_calories || 2000))
  }

  async function saveEdit() {
    if (!editingId) return
    await fetch('/api/members', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, name: editName, color: editColor, maintenance_calories: parseInt(editCals) || 2000 }) })
    setEditingId(null)
    showToast('Profile updated! ✅')
    reload()
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>👨‍👩‍👧‍👦 Family Members</h2>
      <Card style={{ margin: '12px 0 16px' }}>
        {data.members.map(mem => {
          const color = getMemberColor(mem.name, data.members)
          const isEditing = editingId === mem.id
          return (
            <div key={mem.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
                <Avatar name={mem.name} color={color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{mem.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {mem.maintenance_calories || 2000} cal/day maintenance
                  </div>
                </div>
                <button onClick={() => isEditing ? setEditingId(null) : startEdit(mem)} style={{ background: 'none', border: '0.5px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13 }}>
                  {isEditing ? 'Cancel' : '✏️ Edit'}
                </button>
                <button onClick={() => removeMember(mem.id, mem.name)} style={{ background: 'none', border: '0.5px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: 'var(--red)', fontFamily: 'inherit', fontSize: 13 }}>
                  🗑️
                </button>
              </div>
              {isEditing && (
                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: 14, margin: '8px 0' }}>
                  <FormGroup label="Name">
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} />
                  </FormGroup>
                  <FormGroup label="Maintenance Calories (daily)">
                    <input type="number" value={editCals} onChange={e => setEditCals(e.target.value)} placeholder="e.g. 2000" style={inputStyle} />
                  </FormGroup>
                  <FormGroup label="Color">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {MEMBER_COLORS.map(c => (
                        <div key={c} onClick={() => setEditColor(c)} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: editColor === c ? '3px solid var(--text)' : '2px solid transparent' }} />
                      ))}
                    </div>
                  </FormGroup>
                  <Btn full onClick={saveEdit}><i className="ti ti-check" /> Save Profile</Btn>
                </div>
              )}
            </div>
          )
        })}
        <div style={{ marginTop: 14 }}>
          <FormGroup label="Add family member">
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} placeholder="Name" style={{ ...inputStyle, flex: 1 }} />
              <Btn onClick={addMember}><i className="ti ti-plus" /></Btn>
            </div>
          </FormGroup>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
            {MEMBER_COLORS.map(c => (
              <div key={c} onClick={() => setNewColor(c)} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: newColor === c ? '3px solid var(--text)' : '2px solid transparent' }} />
            ))}
          </div>
        </div>
      </Card>

      <h2>📊 Stats</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {[['Workouts', data.workouts.length], ['Meals', data.meals.length], ['Weigh-ins', data.weights.length], ['Comments', data.comments.length]].map(([label, val]) => (
          <div key={label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>
        <p>FamilyFit 💪 Built for your health journey</p>
      </div>
    </div>
  )
}
