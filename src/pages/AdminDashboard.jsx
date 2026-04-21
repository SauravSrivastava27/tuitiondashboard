import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import Card from "../components/Card";
import LoadingSpinner from "../components/LoadingSpinner";
import Badge from "../components/Badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/analytics/dashboard")
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to load dashboard stats:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  if (!stats) return <AdminLayout><div className="text-center font-bold text-nb-pink py-12 uppercase tracking-widest">Failed to load dashboard</div></AdminLayout>;

  const data = stats;

  const StatCard = ({ title, value, icon, colorClass, bgColorClass, rotateClass = "" }) => (
    <Card className={`${bgColorClass} border-3 hover:translate-x-0 hover:translate-y-0 hover:scale-105 transition-all duration-300 group ${rotateClass}`}>
      <div className="nb-card-header !p-1 !text-[8px] !bg-nb-black !-mt-7 !-mx-7">
        <span>METRIC_VIEW</span>
        <span className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-nb-pink"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-nb-yellow"></div>
        </span>
      </div>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-nb-black/60 mb-1">{title}</div>
          <div className={`text-3xl font-black ${colorClass} tracking-tighter drop-shadow-[1px_1px_0px_white]`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
        </div>
        <div className="text-4xl filter drop-shadow-[3px_3px_0px_black] group-hover:scale-110 transition-transform">{icon}</div>
      </div>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        {/* Floating Background Sticker */}
        <div className="absolute -top-12 -right-4 nb-sticker bg-nb-yellow w-24 h-24 animate-float text-xs z-0 hidden lg:flex">
          LIVE DATA<br/>FEED-01
        </div>

        <div className="mb-12 relative z-10">
          <h1 className="text-7xl font-black uppercase tracking-tighter m-0 [text-shadow:4px_4px_0_#FFE600]">
            Command Center
          </h1>
          <p className="text-sm font-black text-nb-black/40 uppercase tracking-[0.3em] mt-3 italic">
            BrightMinds Infrastructure // v2.0
          </p>
        </div>

        {/* Status Section */}
        <div className="mb-16 relative">
          <h3 className="flex items-center gap-3 text-2xl font-black uppercase mb-8 tracking-tighter">
            <span className="p-2 bg-nb-yellow border-3 border-nb-black shadow-[4px_4px_0px_black] rotate-[-3deg]">👫</span> 
            Student Enrollment
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Total Registry" value={data.students.total} icon="💎" colorClass="text-nb-black" bgColorClass="bg-white" rotateClass="lg:rotate-1" />
            <StatCard title="Active Units" value={data.students.active} icon="🔥" colorClass="text-nb-green" bgColorClass="bg-nb-green/5" rotateClass="lg:-rotate-2" />
            <StatCard title="Graduated" value={data.students.completed} icon="👑" colorClass="text-nb-blue" bgColorClass="bg-nb-blue/5" rotateClass="lg:rotate-2" />
            <StatCard title="Standby" value={data.students.inactive} icon="🌑" colorClass="text-nb-pink" bgColorClass="bg-nb-pink/5" rotateClass="lg:-rotate-1" />
          </div>
        </div>

        {/* Fees Stats */}
        <div className="mb-16">
          <h3 className="flex items-center gap-3 text-2xl font-black uppercase mb-8 tracking-tighter">
            <span className="p-2 bg-nb-green border-3 border-nb-black shadow-[4px_4px_0px_black] rotate-[5deg]">💸</span>
            Revenue Streams
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <StatCard
              title="Projected"
              value={`₹${data.fees.total.toLocaleString()}`}
              icon="💰"
              colorClass="text-nb-black"
              bgColorClass="bg-white"
              rotateClass="lg:-rotate-1"
            />
            <StatCard
              title="Received"
              value={`₹${data.fees.paid.toLocaleString()}`}
              icon="🏦"
              colorClass="text-nb-green"
              bgColorClass="bg-nb-green/10"
              rotateClass="lg:rotate-1"
            />
            <StatCard
              title="Outstanding"
              value={`₹${data.fees.remaining.toLocaleString()}`}
              icon="🚨"
              colorClass="text-nb-pink"
              bgColorClass="bg-nb-pink/10"
              rotateClass="lg:rotate-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Users Stats */}
          <div className="relative">
             {/* Sticker */}
            <div className="absolute -top-6 -right-6 nb-sticker bg-nb-blue w-16 h-16 text-[10px] z-20 animate-wiggle">
              SECURE
            </div>
            <h3 className="flex items-center gap-3 text-2xl font-black uppercase mb-8 tracking-tighter">
              <span className="p-2 bg-nb-blue border-3 border-nb-black shadow-[4px_4px_0px_black] rotate-[-5deg]">👤</span> 
              Identities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <Card className="bg-nb-yellow/5 border-3 rotate-1">
                <div className="text-[10px] font-black uppercase text-nb-black/40 mb-2">Aggregate</div>
                <div className="text-4xl font-black tracking-tighter">{data.users.total}</div>
              </Card>
              <Card className="bg-nb-pink/5 border-3 -rotate-1">
                <div className="text-[10px] font-black uppercase text-nb-black/40 mb-2">Privileged</div>
                <div className="text-4xl font-black text-nb-pink tracking-tighter">{data.users.admin}</div>
              </Card>
              <Card className="bg-nb-blue/5 border-3 rotate-2">
                <div className="text-[10px] font-black uppercase text-nb-black/40 mb-2">Base</div>
                <div className="text-4xl font-black text-nb-blue tracking-tighter">{data.users.student}</div>
              </Card>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <h3 className="flex items-center gap-3 text-2xl font-black uppercase mb-8 tracking-tighter">
              <span className="p-2 bg-nb-violet border-3 border-nb-black shadow-[4px_4px_0px_black] rotate-[3deg] text-white">⚡</span> 
              Operations
            </h3>
            <Card className="h-full nb-pattern bg-white/40 border-3 relative overflow-hidden group">
              <div className="absolute inset-0 bg-nb-violet/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex gap-6 flex-wrap relative z-10 justify-center p-4">
                <a href="/admin/students" className="nb-button-primary no-underline text-xs !px-6 py-4">
                  + REGISTER_UNIT
                </a>
                <a href="/admin/fees" className="nb-button-secondary no-underline text-xs !px-6 py-4">
                  $ RECORD_LEDGER
                </a>
                <a href="/admin/reports" className="nb-button-accent no-underline text-xs !px-6 py-4">
                  📊 GEN_REPORT
                </a>
              </div>
            </Card>
          </div>
        </div>

        {/* Recently Created Users */}
        {data.recentlyCreatedUsers && data.recentlyCreatedUsers.length > 0 && (
          <div className="mt-20">
            <h3 className="flex items-center gap-3 text-2xl font-black uppercase mb-8 tracking-tighter">
              <span className="p-2 bg-white border-3 border-nb-black shadow-[4px_4px_0px_black] rotate-[-2deg]">✨</span> 
              New Access Key Signals
            </h3>
            <Card className="border-3 p-0 overflow-hidden shadow-[12px_12px_0px_black]">
              <div className="nb-card-header !m-0 border-b-3 border-black">
                <span>RECENT_LOGS</span>
                <span className="font-bold text-nb-green">SYSTEM_NOMINAL</span>
              </div>
              <div className="divide-y-3 divide-black">
                {data.recentlyCreatedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center p-6 bg-white hover:bg-nb-yellow/10 transition-all cursor-default group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 border-3 border-black bg-nb-blue flex items-center justify-center font-black group-hover:rotate-12 transition-transform">
                        {user.studentName[0]}
                      </div>
                      <div>
                        <div className="text-lg font-black uppercase tracking-tighter text-nb-black leading-none mb-1">
                          {user.studentName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="px-2 py-0.5 border-2 border-black bg-nb-green font-black text-[9px] uppercase tracking-widest hidden sm:block">
                        NEW_USER
                      </span>
                      <div className="text-[10px] font-black text-nb-black/60 uppercase tracking-tighter font-mono bg-nb-black/5 p-2 border border-nb-black/10">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          year: '2-digit', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>

  );
}

