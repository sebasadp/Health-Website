'use client'
import React, { useState, useRef } from 'react'
import { AppData } from '@/app/page'
import { Avatar, Badge, Card, Btn, FormGroup, inputStyle, SubTabs, EmptyState } from './ui'
import { getMemberColor, timeAgo, todayStr, MEAL_TYPES, MEAL_EMOJIS, uploadImage, formatDate } from '@/lib/utils'

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

export default function FoodTab({ data, reload, showToast }: Props) {
  const [sub, setSub] = useState('feed')
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const tabs = [{ id: 'feed', label: 'Feed' }, { id: 'dashboard', label: 'Dashboard' }, { id: 'add', label: '+ Add Meal' }]
  return (
    <div>
      <SubTabs tabs={tabs} active={sub} onChange={setSub} />
      {sub !== 'add' && <DateNav date={selectedDate} onChange={setSelectedDate} />}
      {sub === 'feed' && <FeedView data={data} reload={reload} showToast={showToast} selectedDate={selectedDate} />}
      {sub === 'dashboard' && <DashboardView data={data} selectedDate={selectedDate} />}
      {sub === 'add' && <AddMealView data={data} reload={reload} showToast={showToast} onDone={() => setSub('feed')} />}
    </div>
  )
}

function FeedView({ data, reload, showToast, selectedDate }: Props & { selectedDate: string }) {
  const sorted = [...data.meals].filter(m => m.date === selectedDate).sort((a, b) => b.created_at.localeCompare(a.created_at))
  if (!sorted.length) return <EmptyState emoji="🍽️" title={`No meals logged`} subtitle={selectedDate === todayStr() ? 'Tap + Add Meal to get started!' : 'Nothing logged on this day'} />
  return <div style={{ marginTop: 12 }}>{sorted.map(meal => <MealCard key={meal.id} meal={meal} data={data} reload={reload} showToast={showToast} />)}</div>
}

function MealCard({ meal, data, reload, showToast }: { meal: AppData['meals'][0] } & Props) {
  const [commentMember, setCommentMember] = useState('')
  const [commentText, setCommentText] = useState('')
  const color = getMemberColor(meal.member_name, data.members)
  const comments = data.comments.filter(c => c.meal_id === meal.id)
  const mealBadgeColor = ({ Breakfast: 'amber', Lunch: 'blue', Dinner: 'blue', Snacks: 'green' } as Record<string, 'amber'|'blue'|'green'>)[meal.meal_type] || 'blue'

  async function addComment() {
    if (!commentMember || !commentText.trim()) return showToast('Select your name and type a comment')
    await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ meal_id: meal.id, member_name: commentMember, text: commentText.trim() }) })
    setCommentText(''); reload()
  }
  async function deleteMeal() {
    if (!confirm('Delete this meal entry?')) return
    await fetch(`/api/meals?id=${meal.id}`, { method: 'DELETE' })
    showToast('Meal deleted'); reload()
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', margin: '12px 16px', overflow: 'hidden' }}>
      <div style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Avatar name={meal.member_name} color={color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{meal.member_name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{meal.meal_type} · {timeAgo(meal.created_at)}</div>
          </div>
          <Badge color={mealBadgeColor}>{MEAL_EMOJIS[meal.meal_type]} {meal.meal_type}</Badge>
          <button onClick={deleteMeal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, padding: '0 4px' }}>🗑️</button>
        </div>
        {meal.photo_urls?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8 }}>
            {meal.photo_urls.map((url, i) => <img key={i} src={url} alt="meal" style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />)}
          </div>
        )}
        {meal.description && <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.5, marginBottom: meal.calories ? 6 : 0 }}>{meal.description}</p>}
        {meal.calories && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>🔥 {meal.calories} calories</div>}
      </div>
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
    </div>
  )
}

function DashboardView({ data, selectedDate }: { data: AppData; selectedDate: string }) {
  const dayMeals = data.meals.filter(m => m.date === selectedDate)
  return (
    <Card>
      <h3 style={{ marginBottom: 14 }}>📊 Meal Completion</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>
            <th style={{ textAlign: 'left', padding: '6px 4px', color: 'var(--text2)', fontWeight: 600 }}>Member</th>
            {MEAL_TYPES.map(mt => <th key={mt} style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--text2)', fontWeight: 600, fontSize: 11 }}>{mt.slice(0, 3)}</th>)}
            <th style={{ textAlign: 'center', padding: '6px 4px', color: 'var(--text2)', fontWeight: 600, fontSize: 11 }}>Cal</th>
          </tr></thead>
          <tbody>
            {data.members.map(mem => {
              const done = MEAL_TYPES.map(mt => dayMeals.some(m => m.member_name === mem.name && m.meal_type === mt))
              const cals = dayMeals.filter(m => m.member_name === mem.name).reduce((sum, m) => sum + (m.calories || 0), 0)
              const maintenance = (mem as any).maintenance_calories || 2000
              const over = cals > 0 && cals > maintenance
              return (
                <tr key={mem.id}>
                  <td style={{ padding: '8px 4px', fontWeight: 500, fontSize: 12 }}>{mem.name}</td>
                  {done.map((d, i) => <td key={i} style={{ textAlign: 'center', padding: '8px 4px' }}>{d ? <span style={{ color: 'var(--green)', fontSize: 18 }}>✓</span> : <span style={{ color: 'var(--border)' }}>·</span>}</td>)}
                  <td style={{ textAlign: 'center', fontSize: 12, fontWeight: 500, color: cals === 0 ? 'var(--text3)' : over ? 'var(--red)' : 'var(--green)' }}>{cals > 0 ? cals : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AddMealView({ data, reload, showToast, onDone }: Props & { onDone: () => void }) {
  const [member, setMember] = useState('')
  const [mealType, setMealType] = useState('')
  const [description, setDescription] = useState('')
  const [calories, setCalories] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setPhotos(files)
    Promise.all(files.map(f => new Promise<string>(res => { const r = new FileReader(); r.onload = ev => res(ev.target!.result as string); r.readAsDataURL(f) }))).then(setPreviews)
  }

  async function submit() {
    if (!member || !mealType) return showToast('Please select your name and meal type')
    setLoading(true)
    let photoUrls: string[] = []
    for (const photo of photos) {
      const url = await uploadImage(photo, 'photos', `meals/${Date.now()}-${photo.name}`)
      if (url) photoUrls.push(url)
    }
    await fetch('/api/meals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_name: member, meal_type: mealType, description, photo_urls: photoUrls, date: todayStr(), calories: calories ? parseInt(calories) : null }) })
    setLoading(false); showToast('Meal logged! 🎉'); reload(); onDone()
  }

  return (
    <Card>
      <h3 style={{ marginBottom: 14 }}>🍽️ Log a Meal</h3>
      <FormGroup label="Who's eating?">
        <select value={member} onChange={e => setMember(e.target.value)} style={inputStyle}>
          <option value="">Select family member</option>
          {data.members.map(m => <option key={m.id}>{m.name}</option>)}
        </select>
      </FormGroup>
      <FormGroup label="Meal type">
        <select value={mealType} onChange={e => setMealType(e.target.value)} style={inputStyle}>
          <option value="">Select meal type</option>
          {MEAL_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </FormGroup>
      <FormGroup label="Calories (optional)">
        <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="e.g. 450" min="0" max="5000" style={inputStyle} />
      </FormGroup>
      <FormGroup label="Description (optional)">
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What did you eat? How was it?" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
      </FormGroup>
      <FormGroup label="Photos (optional)">
        <div onClick={() => fileRef.current?.click()} style={{ border: '1.5px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', color: 'var(--text3)' }}>
          <i className="ti ti-camera" style={{ fontSize: 28 }} /><p style={{ marginTop: 6, fontSize: 14 }}>Tap to add photos</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handlePhotos} style={{ display: 'none' }} />
        {previews.length > 0 && <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>{previews.map((p, i) => <img key={i} src={p} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />)}</div>}
      </FormGroup>
      <Btn full onClick={submit}>{loading ? <i className="ti ti-loader spin" /> : <i className="ti ti-check" />} Log Meal</Btn>
    </Card>
  )
}
