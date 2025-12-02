'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { getUser, clearToken } from '@/lib/axios';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { Users, BookOpen, Activity, FileText, TrendingUp, User, LogOut, Menu, X, Search, PlusCircle, HelpCircle, Calendar, Award, Zap, Trophy, Target } from 'lucide-react';

interface HomeStats {
  statistics: {
    groupCount: number;
    sessionCount: number;
    activeSessions: number;
    resourceCount: number;
  };
  groups: Array<{
    _id: string;
    subject: string;
    topic: string;
    grade: string;
    memberCount: number;
  }>;
  recentActivity: Array<{
    _id: string;
    actionType: string;
    details: any;
    timestamp: string;
    userId?: {
      _id: string;
      email: string;
      role: string;
      profile?: {
        name?: string;
      };
    };
  }>;
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const user = getUser();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchHome();
  }, []);

  const fetchHome = async () => {
    try {
      // Use existing endpoints to build stats
      let userGroups: any[] = [];
      let recentActivity: any[] = [];
      let userSessions: any[] = [];
      let userResources: any[] = [];
      
      try {
        const groupsResponse = await axios.get('/groups/my?page=1&limit=50');
        userGroups = groupsResponse.data.groups || [];
      } catch (e) {
        console.error('Error fetching groups:', e);
      }

      try {
        const activityResponse = await axios.get('/activity-logs/my?page=1&limit=10');
        recentActivity = activityResponse.data.logs || [];
        console.log('Activity logs fetched:', recentActivity);
      } catch (e) {
        console.error('Error fetching activity logs:', e);
      }

      try {
        const sessionsResponse = await axios.get('/sessions/list?page=1&limit=1000');
        userSessions = sessionsResponse.data.sessions || [];
        // Count sessions where user is in attendees array or is the teacher
        const attendedSessions = userSessions.filter(session => 
          session.attendees?.some((a: any) => a.userId === user?.id || a.userId?._id === user?.id) ||
          session.teacherId === user?.id ||
          session.teacherId?._id === user?.id
        );
        console.log('User attended sessions:', attendedSessions.length);
      } catch (e) {
        console.error('Error fetching sessions:', e);
      }

      try {
        const resourcesResponse = await axios.get('/resources/my?page=1&limit=1000');
        userResources = resourcesResponse.data.resources || [];
        console.log('User uploaded resources:', userResources.length);
      } catch (e) {
        console.error('Error fetching resources:', e);
      }

      const dashboardStats = {
        statistics: {
          groupCount: userGroups.length,
          sessionCount: userSessions.filter(session => 
            session.attendees?.some((a: any) => a.userId === user?.id || a.userId?._id === user?.id) ||
            session.teacherId === user?.id ||
            session.teacherId?._id === user?.id
          ).length,
          resourceCount: userResources.length,
          activeSessions: 0,
        },
        groups: userGroups,
        recentActivity: recentActivity,
      };

      setStats(dashboardStats);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    } catch (err: any) {
      console.error('Failed to fetch home data:', err);
      setIsLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-linear-to-br from-purple-300/30 to-blue-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>
        <div className="text-center z-10">
          <Activity className="w-16 h-16 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600 animate-pulse">{t('home.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-linear-to-br from-blue-300/20 to-indigo-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-linear-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-linear-to-br from-green-300/20 to-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '5s' }} />
      </div>

      {/* Navigation Header */}
      <header className={`bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-lg sm:text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <span className="hidden sm:inline">{t('common.appName')}</span>
                <span className="sm:hidden">Learn</span>
              </h1>
              <nav className="hidden lg:flex gap-4 xl:gap-6">
                <button className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 transition-all duration-200 text-sm xl:text-base">{t('home.nav.home')}</button>
                <button onClick={() => router.push('/groups')} className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base">{t('home.nav.groups')}</button>
                <button onClick={() => router.push('/help')} className="text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:scale-105 text-sm xl:text-base">{t('home.nav.communityHelp')}</button>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block">
                <LanguageSelector />
              </div>
              <button onClick={() => router.push('/profile')} className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-md text-sm">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">{t('home.profile')}</span>
              </button>
              <button onClick={handleLogout} className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 hover:shadow-md text-sm">
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t('home.logout')}</span>
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200">
                {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4 space-y-2 animate-fade-in">
              <div className="sm:hidden mb-3">
                <LanguageSelector />
              </div>
              <button onClick={() => router.push('/groups')} className="w-full text-left px-4 py-2 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3">
                <Users className="w-5 h-5" />
                {t('home.nav.groups')}
              </button>
              <button onClick={() => router.push('/help')} className="w-full text-left px-4 py-2 rounded-xl hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 flex items-center gap-3">
                <HelpCircle className="w-5 h-5" />
                {t('home.nav.communityHelp')}
              </button>
              <button onClick={() => router.push('/profile')} className="sm:hidden w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-all duration-200 flex items-center gap-3">
                <User className="w-5 h-5" />
                {t('home.profile')}
              </button>
              <button onClick={handleLogout} className="sm:hidden w-full text-left px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all duration-200 flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                {t('home.logout')}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        {/* Welcome Section */}
        <div className={`bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 text-white relative overflow-hidden transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 animate-fade-in">
                {t('home.welcome')}, {user?.profile?.name || t('home.student')}! 
              </h2>
              <p className="text-blue-100 text-sm sm:text-base md:text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {t('home.welcomeSubtitle')}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 animate-bounce-in hidden sm:block" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {[
            { label: t('home.stats.myGroups'), value: stats?.statistics.groupCount || 0, icon: Users, color: 'blue', delay: '150' },
            { label: t('home.stats.sessionsJoined'), value: stats?.statistics.sessionCount || 0, icon: Calendar, color: 'green', delay: '200' },
            { label: t('home.stats.activeNow'), value: stats?.statistics.activeSessions || 0, icon: Zap, color: 'purple', delay: '250' },
            { label: t('home.stats.resources'), value: stats?.statistics.resourceCount || 0, icon: FileText, color: 'orange', delay: '300' },
          ].map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className={`bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-${stat.color}-500 card-hover transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${stat.delay}ms` }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-0">{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl font-bold text-${stat.color}-600 mt-1 sm:mt-2`}>{stat.value}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 text-${stat.color}-500 opacity-60 hover:scale-125 transition-transform duration-300`} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* My Groups */}
          <div className={`lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" /> 
                <span className="hidden sm:inline">{t('home.myLearningGroups')}</span>
                <span className="sm:hidden">My Groups</span>
              </h2>
              <button onClick={() => router.push('/groups')} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all duration-200">
                <span className="hidden sm:inline">{t('home.viewAll')}</span>
                <span className="sm:hidden">All</span>
                <Search className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
            {stats?.groups && stats.groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {stats.groups.slice(0, 4).map((group, index) => (
                  <div key={group._id} onClick={() => router.push(`/groups/${group._id}`)} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 bg-white/50 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{group.subject}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-1">{group.topic}</p>
                        <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 sm:py-1 rounded-full">
                            {t('home.grade')} {group.grade}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" /> {group.memberCount}
                          </span>
                        </div>
                      </div>
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 hover:scale-110 transition-transform flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 animate-fade-in">
                <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4 animate-bounce-in" />
                <p className="text-gray-500 mb-4 text-sm sm:text-base">{t('home.noGroups')}</p>
                <button onClick={() => router.push('/groups')} className="px-4 sm:px-6 py-2 sm:py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg text-sm sm:text-base flex items-center gap-2 mx-auto">
                  <Search className="w-4 h-4" />
                  {t('home.exploreGroups')}
                </button>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" /> 
              <span className="hidden sm:inline">{t('home.recentActivity')}</span>
              <span className="sm:hidden">Activity</span>
            </h2>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {stats.recentActivity.slice(0, 6).map((activity, index) => {
                  const actionIconsMap: { [key: string]: any } = {
                    'joined_group': Users,
                    'left_group': Users,
                    'joined_session': Calendar,
                    'uploaded_resource': FileText,
                    'created_group': PlusCircle,
                    'completed_session': Target,
                    'resource_create': FileText,
                    'name_change': User,
                  };
                  const IconComponent = actionIconsMap[activity.actionType] || Activity;
                  return (
                    <div key={activity._id} className="flex items-start gap-2 sm:gap-3 border-l-2 border-blue-500 pl-2 sm:pl-3 py-2 hover:bg-blue-50/50 transition-all duration-200 rounded-r-lg animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 capitalize truncate">
                          {activity.actionType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 animate-fade-in">
                <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 animate-bounce-in" />
                <p className="text-xs sm:text-sm text-gray-500">{t('home.noActivity')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> {t('home.quickActions')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <button onClick={() => router.push('/groups')} className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 mb-2 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{t('home.actions.exploreGroups')}</div>
            </button>
            <button onClick={() => router.push('/groups')} className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-green-500 hover:bg-green-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <PlusCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-500 mb-2 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors">{t('home.actions.createGroup')}</div>
            </button>
            <button onClick={() => router.push('/help')} className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-500 mb-2 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">{t('home.actions.getHelp')}</div>
            </button>
            <button className="p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 group hover:scale-105 hover:shadow-lg">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500 mb-2 sm:mb-3 mx-auto group-hover:scale-125 transition-transform duration-300" />
              <div className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">{t('home.actions.scheduleSession')}</div>
            </button>
          </div>
        </div>

        {/* User Reputation Section */}
        {user?.reputation && (
          <div className={`bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full translate-y-1/2" />
            </div>
            <h2 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 relative z-10">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" /> {t('home.yourImpact')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 relative z-10">
              <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-yellow-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.points || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.points')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-green-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.sessionsTaught || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.sessionsTaught')}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 sm:p-6 text-center backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 text-blue-300" />
                <p className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{user.reputation.resourcesShared || 0}</p>
                <p className="text-xs sm:text-sm text-indigo-100">{t('home.reputation.resourcesShared')}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
