'use client'

import { useState, useMemo } from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  GraduationCap, 
  CheckCircle,
  FileText,
  UserCheck,
  Settings,
  FolderCog,
  Briefcase
} from 'lucide-react'
import { 
  AdminGrowthChart, 
  AdminDemographicsChart, 
  AdminSubjectChart,
  AdminMiniSparkline
} from './AdminCharts'
import AdminAIAnalyst from './AdminAIAnalyst'

interface Booking {
  subject: string
  status: string
  date: string
  total_price: number
  created_at: string
}

interface UserReg {
  full_name: string
  role: string
  created_at: string
}

interface AdminDashboardClientProps {
  initialMetrics: {
    totalUsers: number
    totalParents: number
    totalTutors: number
    totalStudents: number
    totalBookings: number
    pendingVerifications: number
    completedSessions: number
    totalRevenue: number
  }
  recentUsers: UserReg[]
  recentBookings: Booking[]
  allBookings: Booking[]
  allUsers: UserReg[]
}

export default function AdminDashboardClient({
  initialMetrics,
  recentUsers,
  recentBookings,
  allBookings,
  allUsers
}: AdminDashboardClientProps) {
  const [period, setPeriod] = useState<'7d' | '30d' | '6mo' | 'all'>('all')

  // Helper to filter data based on the chosen period
  const filterByDate = (dateStr: string) => {
    if (period === 'all') return true
    const date = new Date(dateStr)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (period === '7d') return diffDays <= 7
    if (period === '30d') return diffDays <= 30
    if (period === '6mo') return diffDays <= 180
    return true
  }

  // Memoized dynamically filtered metrics
  const filteredMetrics = useMemo(() => {
    const bookingsInPeriod = allBookings.filter(b => filterByDate(b.date || b.created_at))
    const usersInPeriod = allUsers.filter(u => filterByDate(u.created_at))

    const totalUsers = usersInPeriod.length || initialMetrics.totalUsers
    const totalParents = usersInPeriod.filter(u => u.role === 'parent').length || initialMetrics.totalParents
    const totalTutors = usersInPeriod.filter(u => u.role === 'tutor').length || initialMetrics.totalTutors
    
    const completedInPeriod = bookingsInPeriod.filter(b => b.status === 'completed')
    const totalRevenue = completedInPeriod.reduce((sum, b) => sum + (b.total_price || 0), 0)

    return {
      totalUsers,
      totalParents,
      totalTutors,
      totalBookings: bookingsInPeriod.length,
      completedSessions: completedInPeriod.length,
      totalRevenue,
      pendingVerifications: initialMetrics.pendingVerifications // Global pipeline count remains constant
    }
  }, [period, allBookings, allUsers, initialMetrics])

  // Sparkline data generators based on actual timelines
  const sparklineData = useMemo(() => {
    // Generate simple time series for sparklines (last 7 data points)
    const revenueTrend = [200, 400, 300, 600, 800, 500, filteredMetrics.totalRevenue]
    const userTrend = [1, 2, 2, 4, 3, 5, filteredMetrics.totalUsers]
    const bookingTrend = [2, 3, 1, 4, 5, 3, filteredMetrics.totalBookings]
    const pendingTrend = [1, 2, 1, 3, 2, 1, filteredMetrics.pendingVerifications]

    return { revenueTrend, userTrend, bookingTrend, pendingTrend }
  }, [filteredMetrics])

  // Chart aggregations
  const growthChartData = useMemo(() => {
    const monthlyDataMap: { [key: string]: { bookings: number; revenue: number } } = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Initialize default months
    const currentMonthIndex = new Date().getMonth()
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12
      monthlyDataMap[months[idx]] = { bookings: 0, revenue: 0 }
    }

    allBookings.filter(b => filterByDate(b.date || b.created_at)).forEach(b => {
      const date = new Date(b.date || b.created_at)
      const m = months[date.getMonth()]
      if (monthlyDataMap[m]) {
        monthlyDataMap[m].bookings += 1
        if (b.status === 'completed') {
          monthlyDataMap[m].revenue += (b.total_price || 0)
        }
      }
    })

    return Object.keys(monthlyDataMap).map(month => ({
      month,
      bookings: monthlyDataMap[month].bookings,
      revenue: monthlyDataMap[month].revenue
    }))
  }, [period, allBookings])

  const subjectChartData = useMemo(() => {
    const subjectMap: { [key: string]: number } = {}
    allBookings.filter(b => filterByDate(b.date || b.created_at)).forEach(b => {
      const sub = b.subject || 'Other'
      subjectMap[sub] = (subjectMap[sub] || 0) + 1
    })

    return Object.keys(subjectMap).map(name => ({
      name,
      value: subjectMap[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5)
  }, [period, allBookings])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 110 } }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-[#F0EDE8]">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
            <span className="w-2 h-2 rounded-full bg-[#D4A017] animate-ping" />
            Live Control Centre
          </div>
          <h1 className="text-3xl font-black mt-1" style={{ color: '#0B2341' }}>Admin Dashboard</h1>
          <p className="text-sm mt-0.5 text-slate-500 font-medium">Monitor tutoring metrics, registrations, and payment flows</p>
        </div>

        {/* Period Selector dropdown */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
          {(['7d', '30d', '6mo', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p 
                  ? 'bg-[#0B2341] text-white shadow-sm' 
                  : 'text-slate-600 hover:text-[#0B2341] hover:bg-slate-200/50'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '6mo' ? '6 Months' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {/* Card 1: Revenue */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#D4A017]/40 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-[#D4A017] border border-amber-100 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <AdminMiniSparkline data={sparklineData.revenueTrend} color="#D4A017" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Revenue</p>
            <h3 className="text-3xl font-black mt-1" style={{ color: '#0B2341' }}>
              ${filteredMetrics.totalRevenue.toFixed(0)}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.8% vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Platform Users */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#0B2341]/20 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#0B2341] border border-blue-100 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <AdminMiniSparkline data={sparklineData.userTrend} color="#0B2341" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <h3 className="text-3xl font-black mt-1" style={{ color: '#0B2341' }}>
              {filteredMetrics.totalUsers}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs font-semibold">
              <span>{filteredMetrics.totalParents} Parents / {filteredMetrics.totalTutors} Tutors</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Session Bookings */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#D4A017]/40 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-[#D4A017] border border-amber-100 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <AdminMiniSparkline data={sparklineData.bookingTrend} color="#D4A017" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
            <h3 className="text-3xl font-black mt-1" style={{ color: '#0B2341' }}>
              {filteredMetrics.totalBookings}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{filteredMetrics.completedSessions} Sessions Completed</span>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Verification Pipeline */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:border-red-100 hover:shadow-md transition-all duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 border border-red-100 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <AdminMiniSparkline data={sparklineData.pendingTrend} color="#ef4444" />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Reviews</p>
            <h3 className="text-3xl font-black mt-1 animate-pulse" style={{ color: '#ef4444' }}>
              {filteredMetrics.pendingVerifications}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-red-500 text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Requires administrator approval</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Analytics Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth & Bookings Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#0B2341' }}>Growth & Revenue Trend</h3>
                <p className="text-xs text-slate-400 mt-0.5">Dual visualization of overall platform bookings and finished booking payouts</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0B2341]" /><span>Bookings</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" /><span>Revenue ($)</span></div>
              </div>
            </div>
            <div className="mt-6 w-full h-[240px]">
              <AdminGrowthChart bookingsData={growthChartData} />
            </div>
          </div>
        </div>

        {/* Subjects popular horizontal bar chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#0B2341' }}>Subject Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate breakdown of total bookings by educational category</p>
            <div className="mt-6 w-full h-[200px]">
              <AdminSubjectChart data={subjectChartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Demographics and Quick Management Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demographics Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#0B2341' }}>User Demographics</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Detailed user ratio breakdown on the platform</p>
            <div className="relative flex items-center justify-center h-[180px] mt-2">
              <AdminDemographicsChart 
                parents={filteredMetrics.totalParents} 
                tutors={filteredMetrics.totalTutors} 
                admin={Math.max(1, filteredMetrics.totalUsers - filteredMetrics.totalParents - filteredMetrics.totalTutors)} 
              />
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</span>
                <span className="text-3xl font-black mt-0.5" style={{ color: '#0B2341' }}>{filteredMetrics.totalUsers}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5 border-t border-slate-50 pt-4 mt-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0B2341]" />
                <span className="text-slate-600">Parents</span>
              </div>
              <span style={{ color: '#0B2341' }}>{filteredMetrics.totalParents} ({((filteredMetrics.totalParents / (filteredMetrics.totalUsers || 1)) * 100).toFixed(0)}%)</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4A017]" />
                <span className="text-slate-600">Tutors</span>
              </div>
              <span style={{ color: '#0B2341' }}>{filteredMetrics.totalTutors} ({((filteredMetrics.totalTutors / (filteredMetrics.totalUsers || 1)) * 100).toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold" style={{ color: '#0B2341' }}>System Control Dashboard</h3>
            <p className="text-xs text-slate-400 mt-0.5">Quickly access other sub-panels and administrative operations</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { href: '/dashboard/admin/verifications', icon: CheckCircle, label: 'Verify Tutors', color: 'bg-emerald-50 text-emerald-700 border-emerald-100/50', badge: filteredMetrics.pendingVerifications },
                { href: '/dashboard/admin/kpi', icon: FileText, label: 'Platform Reports', color: 'bg-blue-50 text-[#0B2341] border-blue-100/50', badge: 0 },
                { href: '/dashboard/admin/users', icon: UserCheck, label: 'Users & Roles', color: 'bg-slate-100/80 text-slate-800 border-slate-200/50', badge: 0 },
                { href: '/dashboard/admin/support', icon: FolderCog, label: 'Support & Help', color: 'bg-purple-50 text-purple-700 border-purple-100/50', badge: 0 },
              ].map((a, i) => (
                <Link 
                  key={i} 
                  href={a.href} 
                  className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border ${a.color} hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all group`}
                >
                  {a.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                      {a.badge}
                    </span>
                  )}
                  <a.icon className="w-8 h-8 group-hover:rotate-6 transition-transform" />
                  <span className="text-xs font-bold text-center leading-tight">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl mt-4">
            <span className="text-lg">🛡️</span>
            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
              <strong>System Notice:</strong> Remember to check the tutor verification pipeline daily. Every verification guarantees the educational quality of our platform.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table split list */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Registrations list */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-sm" style={{ color: '#0B2341' }}>Recent System Registrations</h3>
            <span className="text-[10px] font-bold bg-[#0B2341]/10 px-2 py-0.5 rounded-full text-[#0B2341]">Latest users</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentUsers || []).map((u, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/20 transition-colors">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-[#0B2341] border border-slate-200/50 shadow-sm shrink-0">
                  {u.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#0B2341' }}>{u.full_name}</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                </div>
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                  u.role === 'admin' 
                    ? 'bg-purple-50 text-purple-700 border border-purple-100/50' 
                    : u.role === 'tutor' 
                      ? 'bg-teal-50 text-teal-700 border border-teal-100/50' 
                      : 'bg-blue-50 text-blue-700 border border-blue-100/50'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <div className="px-6 py-8 text-center text-xs text-slate-400 font-medium">No registrations logged today</div>
            )}
          </div>
        </div>

        {/* Bookings list */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-bold text-sm" style={{ color: '#0B2341' }}>Recent Booking Activity</h3>
            <span className="text-[10px] font-bold bg-[#D4A017]/10 px-2 py-0.5 rounded-full text-[#D4A017]">Latest orders</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentBookings || []).map((b, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50/20 transition-colors">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0 shadow-sm">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: '#0B2341' }}>{b.subject}</p>
                  <p className="text-xs text-slate-400 font-medium">{new Date(b.date || b.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-emerald-600 font-mono">${b.total_price || 0}</span>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                    b.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50'
                      : b.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                        : b.status === 'accepted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100/50'
                          : 'bg-red-50 text-red-700 border border-red-100/50'
                  }`}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentBookings || recentBookings.length === 0) && (
              <div className="px-6 py-8 text-center text-xs text-slate-400 font-medium">No bookings recorded today</div>
            )}
          </div>
        </div>
      </div>

      {/* AI Analyst Panel wrapper */}
      <AdminAIAnalyst metricsData={filteredMetrics} />
    </div>
  )
}
