'use client'
import React, { useState, useRef } from 'react'
import { AppData } from '@/app/page'
import { Avatar, Card, Btn, FormGroup, inputStyle, SubTabs, EmptyState, ProgressBar, Badge } from './ui'
import { getMemberColor, timeAgo, formatDate, todayStr, WORKOUT_TYPES, WORKOUT_ICONS, uploadImage } from '@/lib/utils'

type Props = { data: AppData; reload: () => void; showToast: (m: string) => void }

function DateNav({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const isToday = date === todayStr()
  function shift(days: number) {
    const d = new Date(date + 'T00:00:00')
    d.setDate(d.getDate() + days)
    onChange(d.toISOString().split('T')[0])
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '12px 16px 0' }}>
      <button onClick={() => shift(-1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 18 }}>‹</button>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{isToday ? 'Today' : formatDate(date)}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}</div>
      </div>
      <button onClick={() => shift(1)} disabled={isToday} style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '6px 14px', cursor: isToday ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 18, opacity: isToday ? 0.3 : 1 }}>›</button>
    </div>
  )
}

export default function WorkoutTab({ data, reload, showToast }: Props) {
  const [sub, setSub] = useState('feed')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const tabs = [{ id: 'feed', label: 'Feed' }, { id: 'add', label: '+ Log Workout' }, { id: 'streaks', label: '🔥 Streaks' }, { id: 'monthly', label: 'Monthly' }]
  return (
    <div>
      <SubTabs tabs={tabs} active={sub} onChange={setSub} />
      {(sub === 'feed') && <DateNav date={selectedDate} onChange={setSelectedDate} />}
      {sub === 'feed' && <FeedView data={data} reload={reload} showToast={showToast} selectedDate={selectedDate} />}
      {sub === 'add' && <AddWorkoutView data={data} reload={reload} showToast={showToast} onDone={() => setSub('feed')} />}
      {sub === 'streaks' && <StreaksView data={data} />}
      {sub === 'monthly' && <MonthlyView data={data} />}
    </div>
  )
}

function FeedView({ data, reload, showToast, selectedDate }: Props & { selectedDate: string }) {
  const sorted = [...data.workouts].filter(w => w.date === selectedDate).sort((a, b) => b.created_at.localeCompare(a.created_at))
  if (!sorted.length) return <EmptyState emoji="💪" title="No workouts logged" subtitle={selectedDate === todayStr() ? 'Tap + Log Workout to start!' : 'Nothing logged on this day'} />
  return (
    <div style={{ padding: '0 8px' }}>
      {sorted.map(w => <WorkoutCard key={w.id} workout={w} data={data} reload={reload} showToast={showToast} />)}
    </div>
  )
}

function WorkoutCard({ workout: w, data, reload, showToast }: { workout: AppData['workouts'][0] } & Props) {
  const [commentMember, setCommentMember] = useState('')
  const [commentText, setCommentText] = useState('')
  const color = getMemberColor(w.member_name, data.members)
  const comments = data.workoutComments.filter(c => c.workout_id === w.id)

  async function addComment() {
    if (!commentMember || !commentText.trim()) return showToast('Select your name and type a comment')
    await fetch('/api/workout-comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workout_id: w.id, member_name: commentMember, text: commentText.trim() }) })
    setCommentText(''); reload()
  }
  async function deleteWorkout() {
    if (!confirm('Delete this workout?')) return
    await fetch(`/api/workouts?id=${w.id}`, { method: 'DELETE' })
    showToast('Workout deleted'); reload()
  }

  return (
    <Card style={{ margin: '12px 8px', padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: w.notes || w.photo_url ? 10 : 0 }}>
          <Avatar name={w.member_name} color={color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{w.member_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(w.date)} · {timeAgo(w.created_at)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20 }}>{WORKOUT_ICONS[w.type] || '⭐'}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)' }}>{w.type}</div>
          </div>
          <button onClick={deleteWorkout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}>🗑️</button>
        </div>
        {w.duration && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: '#dbeafe', color: '#1d4ed8', marginBottom: 8 }}><i className="ti ti-clock" /> {w.duration} min</span>}
        {w.notes && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5 }}>{w.notes}</p>}
        {w.photo_url && <img src={w.photo_url} alt="workout" style={{ width: '100%', borderRadius: 10, marginTop: 10, maxHeight: 200, objectFit: 'cover' }} />}
      </div>
      {/* Comments section */}
      <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderTop: '0.5px solid var(--border)' }}>
        {comments.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
            <Avatar name={c.member_name} color={getMemberColor(c.member_name, data.members)} size={26} />
            <div><span style={{ fontWeight: 600, fontSize: 13 }}>{c.member_name}</span> <span style={{ fontSize: 13 }}>{c.text}</span><br /><span style={{ color: 'var(--text3)', fontSize: 11 }}>{timeAgo(c.created_at)}</span></div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <select value={commentMember} onChange={e => setCommentMember(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '6px 8px', fontSize: 12 }}>
            <option value="">Name...</option>
            {data.members.map(m => <option key={m.id}>{m.name}</option>)}
          </select>
          <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="Cheer them on! 💪" style={{ ...inputStyle, flex: 2, padding: '6px 8px', fontSize: 12 }} />
          <Btn onClick={addComment} small><i className="ti ti-send" /></Btn>
        </div>
      </div>
    </Card>
  )
}

function AddWorkoutView({ data, reload, showToast, onDone }: Props & { onDone: () => void }) {
  const [member, setMember] = useState('')
  const [type, setType] = useState('')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayStr())
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setPhoto(f)
    const r = new FileReader(); r.onload = ev => setPreview(ev.target!.result as string); r.readAsDataURL(f)
  }

  async function submit() {
    if (!member || !type) return showToast('Select your name and workout type')
    setLoading(true)
    let photoUrl: string | null = null
    if (photo) photoUrl = await uploadImage(photo, 'photos', `workouts/${Date.now()}-${photo.name}`)
    await fetch('/api/workouts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_name: member, type, duration: duration ? parseInt(duration) : null, notes: notes || null, photo_url: photoUrl, date }) })
    setLoading(false); showToast('Workout logged! 🔥'); reload(); onDone()
  }

  return (
    <Card>
      <h3 style={{ marginBottom: 14 }}>💪 Log Workout</h3>
      <FormGroup label="Who worked out?">
        <select value={member} onChange={e => setMember(e.target.value)} style={inputStyle}>
          <option value="">Select name</option>
          {data.members.map(m => <option key={m.id}>{m.name}</option>)}
        </select>
      </FormGroup>
      <FormGroup label="Workout type">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {WORKOUT_TYPES.map(t => <button key={t} onClick={() => setType(t)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid var(--border)', background: type === t ? 'var(--accent)' : 'var(--surface)', color: type === t ? '#fff' : 'var(--text2)' }}>{WORKOUT_ICONS[t]} {t}</button>)}
        </div>
      </FormGroup>
      <FormGroup label="Duration (minutes, optional)">
        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45" style={inputStyle} />
      </FormGroup>
      <FormGroup label="Notes (optional)">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How'd it go?" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
      </FormGroup>
      <FormGroup label="Photo (optional)">
        <div onClick={() => fileRef.current?.click()} style={{ border: '1.5px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', color: 'var(--text3)' }}>
          <i className="ti ti-camera" style={{ fontSize: 24 }} /><p style={{ fontSize: 13, marginTop: 4 }}>Add a workout photo</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        {preview && <img src={preview} alt="preview" style={{ width: '100%', borderRadius: 10, marginTop: 8, maxHeight: 200, objectFit: 'cover' }} />}
      </FormGroup>
      <FormGroup label="Date"><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} /></FormGroup>
      <Btn full onClick={submit}>{loading ? <i className="ti ti-loader spin" /> : <i className="ti ti-check" />} Log Workout</Btn>
    </Card>
  )
}

function computeStreak(memberName: string, workouts: AppData['workouts']): number {
  const days = new Set(workouts.filter(w => w.member_name === memberName).map(w => w.date))
  let streak = 0; const d = new Date()
  while (true) { const ds = d.toISOString().split('T')[0]; if (days.has(ds)) { streak++; d.setDate(d.getDate() - 1) } else break }
  return streak
}

function StreaksView({ data }: { data: AppData }) {
  const streaks = data.members.map(mem => ({ mem, current: computeStreak(mem.name, data.workouts), total: new Set(data.workouts.filter(w => w.member_name === mem.name).map(w => w.date)).size })).sort((a, b) => b.current - a.current)
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div style={{ padding: '12px 16px' }}>
      {streaks.map((s, i) => {
        const color = getMemberColor(s.mem.name, data.members)
        return (
          <div key={s.mem.id} style={{ background: 'var(--surface)', borderRadius: 12, border: '0.5px solid var(--border)', padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 18 }}>{medals[i] || ''}</div>
              <Avatar name={s.mem.name} color={color} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{s.mem.name}</div><div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.total} total workout days</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 24, fontWeight: 800, color: s.current > 0 ? '#f59e0b' : 'var(--text3)' }}>🔥{s.current}</div><div style={{ fontSize: 11, color: 'var(--text3)' }}>day streak</div></div>
            </div>
            {s.current > 0 ? <div style={{ marginTop: 10 }}><ProgressBar value={s.current / 30 * 100} color="#f59e0b" /><div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{s.current}/30 days</div></div>
              : <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>Log a workout to start your streak!</div>}
          </div>
        )
      })}
    </div>
  )
}

function MonthlyView({ data }: { data: AppData }) {
  const now = new Date(); const daysGone = now.getDate(); const monthStr = now.toISOString().slice(0, 7)
  return (
    <div style={{ padding: '12px 16px' }}>
      <h2 style={{ fontSize: 16, marginBottom: 4 }}>Monthly Completion</h2>
      <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16 }}>{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      {data.members.map(mem => {
        const count = new Set(data.workouts.filter(w => w.member_name === mem.name && w.date.startsWith(monthStr)).map(w => w.date)).size
        const pct = Math.round(count / daysGone * 100)
        const color = getMemberColor(mem.name, data.members)
        return (
          <div key={mem.id} style={{ background: 'var(--surface)', borderRadius: 12, border: '0.5px solid var(--border)', padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar name={mem.name} color={color} size={28} />
              <div style={{ flex: 1, fontWeight: 500, fontSize: 14 }}>{mem.name}</div>
              <Badge color={pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red'}>{pct}%</Badge>
            </div>
            <ProgressBar value={pct} color={color} />
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{count} of {daysGone} days</div>
          </div>
        )
      })}
    </div>
  )
}
