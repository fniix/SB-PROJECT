'use client'

import { useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts'

// Prevents Recharts SSR hydration bugs in Next.js
function HydrationWrapper({ children, height = 220 }: { children: React.ReactNode; height?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div 
        className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl flex items-center justify-center animate-pulse"
        style={{ height: `${height}px` }}
      >
        <span className="text-xs text-slate-400 font-medium tracking-wide">Loading Analytics Chart...</span>
      </div>
    )
  }

  return <>{children}</>
}

// 1. Sparkline for KPI Cards
export function AdminMiniSparkline({ data, color = '#D4A017' }: { data: number[]; color?: string }) {
  const chartData = data.map((v, i) => ({ day: i, val: v }))

  return (
    <div className="w-20 h-8 shrink-0">
      <HydrationWrapper height={32}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${color})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </HydrationWrapper>
    </div>
  )
}

// 2. Growth Summary: Bookings vs Revenue Trend
export function AdminGrowthChart({ bookingsData }: { bookingsData?: any[] }) {
  const defaultData = [
    { month: 'Jan', bookings: 120, revenue: 2400 },
    { month: 'Feb', bookings: 150, revenue: 3100 },
    { month: 'Mar', bookings: 110, revenue: 2200 },
    { month: 'Apr', bookings: 180, revenue: 3800 },
    { month: 'May', bookings: 220, revenue: 4500 },
    { month: 'Jun', bookings: 294, revenue: 6100 },
    { month: 'Jul', bookings: 250, revenue: 5200 },
    { month: 'Aug', bookings: 310, revenue: 6400 },
    { month: 'Sep', bookings: 350, revenue: 7300 },
  ]

  const chartData = bookingsData && bookingsData.length > 0 ? bookingsData : defaultData

  return (
    <HydrationWrapper height={240}>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4A017" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#D4A017" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B2341" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0B2341" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            dy={8}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#64748b' }} 
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: '#0B2341', 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              color: 'white',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'white' }}
            cursor={{ stroke: '#e2e8f0', strokeWidth: 1.5 }}
          />
          <Area 
            name="Revenue ($)" 
            type="monotone" 
            dataKey="revenue" 
            stroke="#D4A017" 
            strokeWidth={2.5} 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
          />
          <Area 
            name="Bookings" 
            type="monotone" 
            dataKey="bookings" 
            stroke="#0B2341" 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#colorBookings)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </HydrationWrapper>
  )
}

// 3. User Demographics Pie Chart
export function AdminDemographicsChart({ parents = 0, tutors = 0, admin = 0 }) {
  const data = [
    { name: 'Parents', value: parents || 1 },
    { name: 'Tutors', value: tutors || 1 },
    { name: 'Admin', value: admin || 1 }
  ]

  const COLORS = ['#0B2341', '#D4A017', '#94a3b8']

  return (
    <HydrationWrapper height={180}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
              fontSize: '12px'
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </HydrationWrapper>
  )
}

// 4. Subject Popularity horizontal Bar Chart
export function AdminSubjectChart({ data }: { data?: { name: string; value: number }[] }) {
  const defaultData = [
    { name: 'Math', value: 34 },
    { name: 'Physics', value: 21 },
    { name: 'English', value: 45 },
    { name: 'Chemistry', value: 12 },
    { name: 'Computer Sci', value: 18 }
  ]

  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <HydrationWrapper height={200}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis 
            type="category" 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 11, fill: '#0B2341', fontWeight: 600 }} 
            width={85}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
          />
          <Bar 
            dataKey="value" 
            name="Bookings" 
            fill="#D4A017" 
            radius={[0, 8, 8, 0]} 
            barSize={12} 
          />
        </BarChart>
      </ResponsiveContainer>
    </HydrationWrapper>
  )
}
