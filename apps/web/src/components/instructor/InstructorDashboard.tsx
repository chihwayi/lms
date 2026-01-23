import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, UserX, TrendingDown, BookOpen, Users, Award, BrainCircuit, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  totalStudents: number;
  totalEnrollments: number;
  courseCompletions: number;
  loginActivity: { date: string; count: string }[];
}

interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  course: string;
  reason: string;
  lastAccess?: string;
  progress?: number;
  score?: number;
}

interface AtRiskData {
  inactiveStudents: AtRiskStudent[];
  stalledStudents: AtRiskStudent[];
  failingStudents: AtRiskStudent[];
}

interface CourseInsights {
  progressDistribution: { range: string; count: number }[];
}

interface QuizAnalytics {
  quizStats: { lesson: string; avgScore: number; attempts: number }[];
}

export function InstructorDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [atRisk, setAtRisk] = useState<AtRiskData | null>(null);
  const [insights, setInsights] = useState<CourseInsights | null>(null);
  const [quizStats, setQuizStats] = useState<QuizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, atRiskRes, insightsRes, quizRes] = await Promise.all([
          apiClient('/analytics/dashboard'),
          apiClient('/analytics/at-risk'),
          apiClient('/analytics/course-insights'),
          apiClient('/analytics/quiz-analytics')
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (atRiskRes.ok) setAtRisk(await atRiskRes.json());
        if (insightsRes.ok) setInsights(await insightsRes.json());
        if (quizRes.ok) setQuizStats(await quizRes.json());
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500 animate-pulse">Loading dashboard insights...</p>
        </div>
      </div>
    );
  }

  if (!stats || !atRisk || !insights || !quizStats) return null;

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Instructor Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Overview of student engagement and course performance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live Updates
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
            <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
              Active learners on platform
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Enrollments</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalEnrollments}</div>
            <p className="text-xs text-purple-600 font-medium mt-1 flex items-center gap-1">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Course Completions</CardTitle>
            <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.courseCompletions}</div>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              Graduated students
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Login Activity Chart */}
        <Card className="col-span-4 border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">Login Frequency</CardTitle>
            <CardDescription>Student activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={stats.loginActivity} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'short' })}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="url(#colorCount)" 
                    name="Logins" 
                    radius={[6, 6, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Students List */}
        <Card className="col-span-3 border-none shadow-lg bg-white/80 backdrop-blur-sm flex flex-col h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  At-Risk Students
                </CardTitle>
                <CardDescription>Students needing immediate attention</CardDescription>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar">
              {atRisk.failingStudents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-2 mb-2">
                    <TrendingDown className="h-3 w-3" /> Failing Grades
                  </h4>
                  {atRisk.failingStudents.map(student => (
                    <div key={`failing-${student.id}`} className="group flex items-center justify-between p-3 border border-red-100 rounded-xl bg-red-50/50 hover:bg-red-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{student.name}</span>
                        <span className="text-xs text-gray-500">{student.course}</span>
                      </div>
                      <Badge variant="destructive" className="shadow-sm">
                        {Math.round(student.score!)}% Score
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {atRisk.stalledStudents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2 mb-2 mt-4">
                    <Loader2 className="h-3 w-3" /> Stalled Progress
                  </h4>
                  {atRisk.stalledStudents.map(student => (
                    <div key={`stalled-${student.id}`} className="group flex items-center justify-between p-3 border border-orange-100 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{student.name}</span>
                        <span className="text-xs text-gray-500">{student.course}</span>
                      </div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-white shadow-sm">
                        {Math.round(student.progress!)}% Done
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {atRisk.inactiveStudents.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-2 mt-4">
                    <UserX className="h-3 w-3" /> Inactive
                  </h4>
                  {atRisk.inactiveStudents.map(student => (
                    <div key={`inactive-${student.id}`} className="group flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">{student.name}</span>
                        <span className="text-xs text-gray-500">{student.course}</span>
                      </div>
                      <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                        Inactive
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {atRisk.failingStudents.length === 0 && atRisk.stalledStudents.length === 0 && atRisk.inactiveStudents.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">All Clear!</p>
                    <p className="text-sm text-gray-500">No students are currently at risk.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Course Progress Distribution */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Course Engagement & Drop-off
            </CardTitle>
            <CardDescription>Student distribution by progress completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={insights.progressDistribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="range" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ stroke: '#10b981', strokeWidth: 1 }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorProgress)" 
                    name="Students"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Performance */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-violet-500" />
              Quiz Performance Analysis
            </CardTitle>
            <CardDescription>Average scores and attempts per lesson</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart data={quizStats.quizStats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="lesson" 
                    type="category" 
                    width={100}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }}
                  />
                  <Bar 
                    dataKey="avgScore" 
                    fill="#8b5cf6" 
                    name="Avg Score" 
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                    background={{ fill: '#f3f4f6' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
