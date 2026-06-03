'use client'
import React, { useState } from 'react'
import { AppData } from '@/app/page'
import { Avatar, Badge, Card, Btn, FormGroup, inputStyle, SubTabs, EmptyState } from './ui'
import { getMemberColor, formatDate, todayStr } from '@/lib/utils'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const CHART_COLORS = ['#ef4444','#3b82f6','#f59e0b','#8b5cf6','#06b6d4','#ec4899','#22c55e','#f97316']

type Props = { data: AppData; reload: () => void; showToast: (m: string) => void }

export default function WeightTab({ data, reload, showToast }: Props) {
  const [sub, setSub] = useState('chart')
  const tabs = [{ id: 'chart', label: 'Chart' }, { id: 'history', label: 'History' }, { id: 'add', label: '+ Log Weight' }, { id: 'leaderboard', label: '🏆 Leaders' }]
  return (
    <div>
      <SubTabs tabs={tabs} active={sub} onChange={setSub} />
      {sub === 'chart' && <ChartView data={data} reload={reload} showToast={showToast} />}
      {sub === 'history' && <HistoryView data={data} reload={reload} showToast={showToast} />}
      {sub === 'add' && <AddWeightView data={data} reload={reload} showToast={showToast} onDone={() => setSub('chart')} />}
      {sub === 'leaderboard' && <LeaderboardView data={data} />}
    </div>
  )
}

function ChartView({ data }: Props) {
  const allDates = Array.from(new Set(data.weights.map(w => w.date))).sort()

  const datasets = data.members.map((mem) => {
    const wts = data.weights.filter(w => w.member_name === mem.name).sort((a, b) => a.date.localeCompare(b.date))
    if (!wts.length) return null
    const dataPoints = allDates.map(d => {
      const entry = [...wts].reverse().find(w => w.date <= d)
      return entry ? entry.weight : null
    })
    return { label: mem.name, data: dataPoints, borderColor: mem.color || '#64748b', backgroundColor: 'transparent', tension: 0.3, pointRadius: 4, borderWidth: 2 }
  }).filter(Boolean)

  const stats = data.members.map(mem => {
    const wts = data.weights.filter(w => w.member_name === mem.name).sort((a, b) => a.date.localeCompare(b.date))
    if (!wts.length) return null
    const start = wts[0].weight, current = wts[wts.length - 1].weight
    const change = (current - start).toFixed(1)
    const pct = ((current - start) / start * 100).toFixed(1)
    const weekly = wts.length > 1 ? (current - wts[wts.length - 2].weight).toFixed(1) : null

    // Calorie tracking for today
    const today = todayStr()
    const todayCals = data.meals.filter(m => m.member_name === mem.name && m.date === today).reduce((sum, m) => sum + (m.calories || 0), 0)
    const maintenance = mem.maintenance_calories || 2000
    const calDiff = todayCals - maintenance

    return { mem, start, current, change, pct, weekly, count: wts.length, todayCals, maintenance, calDiff }
  }).filter(Boolean) as any[]

  if (!data.weights.length) return <EmptyState emoji="⚖️" title="No weight entries yet" subtitle="Tap + Log Weight to get started!" />

  return (
    <div>
      <Card>
        <h3 style={{ marginBottom: 4 }}>Weight Progress</h3>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>All family members over time</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {datasets.map((ds, i) => ds && (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text2)' }}>
              <span style={{ width: 12, height: 3, borderRadius: 2, background: ds.borderColor as string, display: 'inline-block' }} />
              {ds.label}
            </span>
          ))}
        </div>
        <div style={{ height: 240 }}>
          <Line
            data={{ labels: allDates.map(d => formatDate(d)), datasets: datasets as never[] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 6, font: { size: 11 } } }, y: { ticks: { font: { size: 11 } } } } }}
          />
        </div>
      </Card>

      {/* Today's Calorie Status */}
      {stats.some((s: any) => s.todayCals > 0) && (
        <Card style={{ margin: '0 16px 10px' }}>
          <h3 style={{ marginBottom: 12 }}>🔥 Today's Calories vs Maintenance</h3>
          {stats.map((s: any) => {
            if (!s.todayCals) return null
            const color = getMemberColor(s.mem.name, data.members)
            const over = s.calDiff > 0
            return (
              <div key={s.mem.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={s.mem.name} color={color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.mem.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.todayCals} / {s.maintenance} cal</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge color={over ? 'red' : 'green'}>{over ? '+' : ''}{s.calDiff} cal</Badge>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{over ? 'Over' : 'Under'} maintenance</div>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {stats.map((s: any) => {
        const color = getMemberColor(s.mem.name, data.members)
        return (
          <Card key={s.mem.id} style={{ margin: '0 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Avatar name={s.mem.name} color={color} />
              <h3>{s.mem.name}</h3>
              <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: parseFloat(s.change) <= 0 ? '#dcfce7' : '#fee2e2', color: parseFloat(s.change) <= 0 ? '#15803d' : '#dc2626' }}>
                {parseFloat(s.change) > 0 ? '+' : ''}{s.change} lbs
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[['Start', s.start + ' lbs'], ['Current', s.current + ' lbs'], ['Change', (parseFloat(s.pct) > 0 ? '+' : '') + s.pct + '%']].map(([label, val], i) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: i === 2 ? (parseFloat(s.pct) <= 0 ? 'var(--green)' : 'var(--red)') : 'var(--text)' }}>{val}</div>
                </div>
              ))}
            </div>
            {s.weekly !== null && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text2)' }}>
                Weekly: <strong style={{ color: parseFloat(s.weekly) <= 0 ? 'var(--green)' : 'var(--red)' }}>{parseFloat(s.weekly) > 0 ? '+' : ''}{s.weekly} lbs</strong> · {s.count} check-ins · Maintenance: {s.maintenance} cal/day
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function HistoryView({ data, reload, showToast }: Props) {
  const sorted = [...data.weights].sort((a, b) => b.date.localeCompare(a.date))
  if (!sorted.length) return <EmptyState emoji="⚖️" title="No entries yet" />

  async function deleteWeight(id: string) {
    if (!confirm('Delete this weight entry?')) return
    await fetch(`/api/weights?id=${id}`, { method: 'DELETE' })
    showToast('Weight entry deleted')
    reload()
  }

  return (
    <div style={{ padding: '0 16px' }}>
      {sorted.map(w => {
        const color = getMemberColor(w.member_name, data.members)
        return (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderBottom: '0.5px solid var(--border)' }}>
            <Avatar name={w.member_name} color={color} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{w.member_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(w.date)}</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{w.weight} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text2)' }}>lbs</span></div>
            <button onClick={() => deleteWeight(w.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}>🗑️</button>
          </div>
        )
      })}
    </div>
  )
}

function AddWeightView({ data, reload, showToast, onDone }: Props & { onDone: () => void }) {
  const [member, setMember] = useState('')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayStr())
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!member || !weight || !date) return showToast('Please fill in all fields')
    const w = parseFloat(weight)
    if (w < 50 || w > 600) return showToast('Please enter a valid weight')
    setLoading(true)
    await fetch('/api/weights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ member_name: member, weight: w, date }) })
    setLoading(false)
    showToast('Weight logged! 💪')
    reload(); onDone()
  }

  return (
    <Card>
      <h3 style={{ marginBottom: 14 }}>⚖️ Log Weight</h3>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
        📅 Weigh-ins are best on <strong>Sunday mornings</strong> for consistency.
      </div>
      <FormGroup label="Family member">
        <select value={member} onChange={e => setMember(e.target.value)} style={inputStyle}>
          <option value="">Select name</option>
          {data.members.map(m => <option key={m.id}>{m.name}</option>)}
        </select>
      </FormGroup>
      <FormGroup label="Weight (lbs)">
        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 165.5" step="0.1" min="50" max="600" style={inputStyle} />
      </FormGroup>
      <FormGroup label="Date">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
      </FormGroup>
      <Btn full onClick={submit}>
        {loading ? <i className="ti ti-loader spin" /> : <i className="ti ti-check" />} Log Weight
      </Btn>
    </Card>
  )
}

function LeaderboardView({ data }: { data: AppData }) {
  const lb = data.members.map(mem => {
    const wts = data.weights.filter(w => w.member_name === mem.name).sort((a, b) => a.date.localeCompare(b.date))
    const change = wts.length >= 2 ? parseFloat((wts[0].weight - wts[wts.length - 1].weight).toFixed(1)) : null
    return { mem, change, count: wts.length }
  }).sort((a, b) => (b.change || 0) - (a.change || 0))

  const medals = ['🥇', '🥈', '🥉']
  return (
    <div>
      <Card style={{ margin: '12px 16px' }}>
        <h3 style={{ marginBottom: 4 }}>🏆 Most Weight Lost</h3>
        <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 14 }}>Total lbs lost since starting</p>
        {lb.map((l, i) => {
          const color = getMemberColor(l.mem.name, data.members)
          return (
            <div key={l.mem.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < lb.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <div style={{ width: 24, textAlign: 'center' }}>{medals[i] || i + 1}</div>
              <Avatar name={l.mem.name} color={color} />
              <div style={{ flex: 1, fontWeight: 500 }}>{l.mem.name}</div>
              <div style={{ textAlign: 'right' }}>
                {l.change !== null
                  ? <div style={{ fontSize: 16, fontWeight: 700, color: l.change >= 0 ? 'var(--green)' : 'var(--red)' }}>-{l.change} lbs</div>
                  : <div style={{ fontSize: 13, color: 'var(--text3)' }}>No data yet</div>}
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l.count} entries</div>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
