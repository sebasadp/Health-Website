'use client'
import React from 'react'
import { AppData } from '@/app/page'
import { Avatar, Badge, Card } from './ui'
import { getMemberColor, getGreeting, todayStr, formatDate, MEAL_TYPES, WORKOUT_ICONS } from '@/lib/utils'

export default function HomeTab({ data }: { data: AppData }) {
  const today = todayStr()
  const todayMeals = data.meals.filter(m => m.date === today)
  const todayWorkouts = data.workouts.filter(w => w.date === today)

  const latestWeights = data.members.map(m => {
    const wts = data.weights.filter(w => w.member_name === m.name).sort((a, b) => b.date.localeCompare(a.date))
    return wts.length ? { member: m, entry: wts[0], prev: wts[1] } : null
  }).filter(Boolean) as { member: typeof data.members[0]; entry: typeof data.weights[0]; prev?: typeof data.weights[0] }[]

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 26 }}>Good {getGreeting()} 👋</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Latest Weights - FIRST */}
      {latestWeights.length > 0 && (
        <Card style={{ margin: '0 0 12px' }}>
          <h3 style={{ marginBottom: 12 }}>⚖️ Latest Weights</h3>
          {latestWeights.map(({ member, entry, prev }) => {
            const color = getMemberColor(member.name, data.members)
            const diff = prev ? (entry.weight - prev.weight).toFixed(1) : null
            return (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar name={member.name} color={color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{member.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{formatDate(entry.date)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{entry.weight} <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>lbs</span></div>
                  {diff !== null && (
                    <div style={{ fontSize: 12, fontWeight: 500, color: parseFloat(diff) <= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {parseFloat(diff) > 0 ? '+' : ''}{diff} lbs
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Today's Workouts - SECOND */}
      <Card style={{ margin: '0 0 12px' }}>
        <h3 style={{ marginBottom: 12 }}>💪 Today's Workouts</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.members.map(mem => {
            const wo = todayWorkouts.find(w => w.member_name === mem.name)
            const color = getMemberColor(mem.name, data.members)
            return (
              <div key={mem.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={mem.name} color={color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{mem.name}</div>
                  {wo
                    ? <div style={{ fontSize: 12, color: 'var(--text2)' }}>{WORKOUT_ICONS[wo.type] || '⭐'} {wo.type}{wo.duration ? ` · ${wo.duration} min` : ''}</div>
                    : <div style={{ fontSize: 12, color: 'var(--text3)' }}>No workout logged</div>}
                </div>
                {wo ? <Badge color="green"><i className="ti ti-check" /></Badge> : <Badge color="red">—</Badge>}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Today's Meals - THIRD */}
      <Card style={{ margin: '0 0 12px' }}>
        <h3 style={{ marginBottom: 12 }}>🍽️ Today's Meals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, fontSize: 11, textAlign: 'center' }}>
          <div />
          {MEAL_TYPES.map(m => <div key={m} style={{ fontWeight: 600, color: 'var(--text2)', padding: '4px 0', fontSize: 10 }}>{m[0]}</div>)}
          {data.members.map(mem => {
            const color = getMemberColor(mem.name, data.members)
            const todayCals = todayMeals.filter(m => m.member_name === mem.name).reduce((sum, m) => sum + ((m as any).calories || 0), 0)
            return (
              <React.Fragment key={mem.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
                  <Avatar name={mem.name} color={color} size={22} />
                  <span style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mem.name.split(' ')[0]}
                  </span>
                </div>
                {MEAL_TYPES.map(mt => {
                  const done = todayMeals.some(m => m.member_name === mem.name && m.meal_type === mt)
                  return (
                    <div key={mt} style={{ padding: '6px 2px' }}>
                      {done ? <span style={{ color: 'var(--green)', fontSize: 16 }}>✓</span> : <span style={{ color: 'var(--border)' }}>·</span>}
                    </div>
                  )
                })}
              </React.Fragment>
            )
          })}
        </div>
        {/* Calorie summary */}
        {data.members.some(mem => todayMeals.filter(m => m.member_name === mem.name).some(m => m.calories)) && (
          <div style={{ marginTop: 12, borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>🔥 Today's Calories</div>
            {data.members.map(mem => {
              const cals = todayMeals.filter(m => m.member_name === mem.name).reduce((sum, m) => sum + ((m as any).calories || 0), 0)
              if (!cals) return null
              const maintenance = (mem as any).maintenance_calories || 2000
              const diff = cals - maintenance
              const color = getMemberColor(mem.name, data.members)
              return (
                <div key={mem.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Avatar name={mem.name} color={color} size={24} />
                  <div style={{ flex: 1, fontSize: 13 }}>{mem.name.split(' ')[0]}</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{cals} cal</div>
                  <div style={{ fontSize: 12, color: diff > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 500 }}>
                    {diff > 0 ? '+' : ''}{diff}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
