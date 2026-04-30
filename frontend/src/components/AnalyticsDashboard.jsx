import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line,
} from 'recharts';
import SectionWrapper from './SectionWrapper';
import { getAnalyticsDashboard } from '../utils/api';

// ── Animated counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '', duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = Date.now();
    const from = 0;
    const to = Number(value) || 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display}{suffix}</>;
}

// ── Custom tooltip styling ──────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDarkMode }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className={`px-3 py-2 text-xs border ${
        isDarkMode
          ? 'bg-gray-900 border-gray-700 text-gray-200'
          : 'bg-white border-gray-300 text-gray-800'
      }`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <p className="font-bold uppercase tracking-wider mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = '', sub, isDarkMode }) {
  return (
    <div
      className={`p-5 border ${
        isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
      }`}
    >
      <p
        className={`text-xs uppercase tracking-widest mb-2 ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {label}
      </p>
      <p
        className={`text-4xl font-black tabular-nums ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      {sub && (
        <p
          className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Progression state badge ─────────────────────────────────────────────────
function ProgressionBadge({ state, isDarkMode }) {
  const map = {
    up: {
      label: '↑ UP',
      cls: isDarkMode ? 'text-green-400 border-green-800' : 'text-green-700 border-green-300',
    },
    deload: {
      label: '↓ DELOAD',
      cls: isDarkMode ? 'text-red-400 border-red-800' : 'text-red-700 border-red-300',
    },
    hold: {
      label: '— HOLD',
      cls: isDarkMode ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-300',
    },
  };
  const { label, cls } = map[state] || map.hold;
  return (
    <span
      className={`text-xs border px-2 py-0.5 ${cls}`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {label}
    </span>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ isDarkMode }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-24 text-center border ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-12 w-12 mb-4 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="square"
          strokeLinejoin="miter"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <p
        className={`text-xs uppercase tracking-widest ${
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        }`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        Complete your first workout to unlock analytics
      </p>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ isDarkMode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gridColor   = isDarkMode ? '#2d2d2d' : '#e5e7eb';
  const axisColor   = isDarkMode ? '#555'    : '#9ca3af';
  const accentColor = isDarkMode ? '#e5e7eb' : '#111111';
  const barFill     = isDarkMode ? '#e5e7eb' : '#111111';
  const radarFill   = isDarkMode ? 'rgba(229,231,235,0.15)' : 'rgba(17,17,17,0.1)';
  const radarStroke = isDarkMode ? '#e5e7eb' : '#111111';

  useEffect(() => {
    (async () => {
      try {
        const res = await getAnalyticsDashboard();
        setData(res.data);
      } catch (err) {
        setError(err?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const mono = { fontFamily: "'IBM Plex Mono', monospace" };
  const axisStyle = { fontSize: 10, fill: axisColor, ...mono };

  if (loading) {
    return (
      <SectionWrapper isDarkMode={isDarkMode}>
        <div className="flex items-center justify-center h-64">
          <div
            className={`w-6 h-6 border-2 border-t-transparent animate-spin ${
              isDarkMode ? 'border-gray-400' : 'border-gray-700'
            }`}
          />
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper isDarkMode={isDarkMode}>
        <div
          className={`p-4 border text-xs ${
            isDarkMode
              ? 'border-red-900 text-red-400 bg-red-950/30'
              : 'border-red-200 text-red-700 bg-red-50'
          }`}
          style={mono}
        >
          ERROR: {error}
        </div>
      </SectionWrapper>
    );
  }

  const hasData =
    data &&
    (data.sessionsCompleted28d > 0 ||
      (data.strengthTrends && data.strengthTrends.length > 0));

  return (
    <SectionWrapper isDarkMode={isDarkMode}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* ── Header ── */}
        <div>
          <p
            className={`text-xs uppercase tracking-widest mb-1 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}
            style={mono}
          >
            / Training Intelligence
          </p>
          <h1
            className={`text-2xl font-black uppercase tracking-wide ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={mono}
          >
            Analytics Dashboard
          </h1>
        </div>

        {!hasData ? (
          <EmptyState isDarkMode={isDarkMode} />
        ) : (
          <>
            {/* ── KPI row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
              <StatCard
                label="Adherence (28d)"
                value={data.adherence28d}
                suffix="%"
                sub={`${data.sessionsCompleted28d} sessions`}
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Sessions (28d)"
                value={data.sessionsCompleted28d}
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="PRs Set (28d)"
                value={data.prCount28d}
                isDarkMode={isDarkMode}
              />
              <StatCard
                label="Current Streak"
                value={data.streakDays}
                suffix=" days"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* ── Volume trend + Muscle breakdown ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Volume Trend */}
              <div
                className={`p-5 border ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-widest mb-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  style={mono}
                >
                  Sessions / Week (Last 8 Weeks)
                </p>
                {data.volumeTrend && data.volumeTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.volumeTrend} barSize={18}>
                      <CartesianGrid vertical={false} stroke={gridColor} />
                      <XAxis
                        dataKey="week"
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                        interval={1}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                        width={24}
                      />
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip {...props} isDarkMode={isDarkMode} />
                        )}
                        cursor={{ fill: isDarkMode ? '#ffffff0a' : '#00000008' }}
                      />
                      <Bar dataKey="sessions" fill={barFill} radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p
                    className={`text-xs py-16 text-center ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                    style={mono}
                  >
                    No completed sessions in the last 8 weeks
                  </p>
                )}
              </div>

              {/* Muscle Breakdown */}
              <div
                className={`p-5 border ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
              >
                <p
                  className={`text-xs uppercase tracking-widest mb-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  style={mono}
                >
                  Muscle Group Frequency
                </p>
                {data.muscleBreakdown && data.muscleBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={data.muscleBreakdown}>
                      <PolarGrid stroke={gridColor} />
                      <PolarAngleAxis
                        dataKey="muscle"
                        tick={{ ...axisStyle, fontSize: 9 }}
                      />
                      <Radar
                        dataKey="count"
                        stroke={radarStroke}
                        fill={radarFill}
                        strokeWidth={1.5}
                      />
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip {...props} isDarkMode={isDarkMode} />
                        )}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p
                    className={`text-xs py-16 text-center ${
                      isDarkMode ? 'text-gray-600' : 'text-gray-400'
                    }`}
                    style={mono}
                  >
                    No muscle data yet
                  </p>
                )}
              </div>
            </div>

            {/* ── Strength Leaderboard ── */}
            {data.strengthTrends && data.strengthTrends.length > 0 && (
              <div
                className={`border ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className={`px-5 py-4 border-b ${
                    isDarkMode ? 'border-gray-800' : 'border-gray-200'
                  }`}
                >
                  <p
                    className={`text-xs uppercase tracking-widest ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    style={mono}
                  >
                    Estimated 1-Rep Max Leaderboard
                  </p>
                </div>
                <div>
                  {data.strengthTrends.map((ex, i) => {
                    const maxRM = data.strengthTrends[0].estimated1RM;
                    const pct = maxRM > 0 ? (ex.estimated1RM / maxRM) * 100 : 0;
                    return (
                      <div
                        key={ex.exercise}
                        className={`flex items-center gap-4 px-5 py-3 border-b last:border-b-0 ${
                          isDarkMode ? 'border-gray-800' : 'border-gray-100'
                        }`}
                      >
                        {/* Rank */}
                        <span
                          className={`text-xs w-5 shrink-0 ${
                            isDarkMode ? 'text-gray-600' : 'text-gray-400'
                          }`}
                          style={mono}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* Exercise name */}
                        <span
                          className={`text-sm font-medium w-40 shrink-0 truncate ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}
                          style={mono}
                        >
                          {ex.exercise}
                        </span>

                        {/* Progress bar */}
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800">
                          <div
                            className={`h-full transition-all duration-700 ${
                              isDarkMode ? 'bg-white' : 'bg-gray-900'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        {/* 1RM */}
                        <span
                          className={`text-sm font-black w-20 text-right shrink-0 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                          style={mono}
                        >
                          {ex.estimated1RM} kg
                        </span>

                        {/* Progression badge */}
                        <div className="w-20 shrink-0 text-right">
                          <ProgressionBadge
                            state={ex.progressionState}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 1RM bar chart */}
                <div className="p-5 pt-2">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                      data={data.strengthTrends}
                      layout="vertical"
                      barSize={12}
                      margin={{ left: 0, right: 0 }}
                    >
                      <CartesianGrid horizontal={false} stroke={gridColor} />
                      <XAxis
                        type="number"
                        tick={axisStyle}
                        axisLine={false}
                        tickLine={false}
                        unit=" kg"
                      />
                      <YAxis
                        type="category"
                        dataKey="exercise"
                        tick={{ ...axisStyle, fontSize: 9 }}
                        axisLine={false}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip {...props} isDarkMode={isDarkMode} />
                        )}
                        cursor={{ fill: isDarkMode ? '#ffffff0a' : '#00000008' }}
                      />
                      <Bar dataKey="estimated1RM" name="Est. 1RM" fill={barFill} radius={0} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Adherence ring ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`p-5 border flex items-center gap-6 ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
              >
                {/* SVG ring */}
                <svg width={100} height={100} viewBox="0 0 100 100" className="shrink-0">
                  <circle cx={50} cy={50} r={40} fill="none" stroke={gridColor} strokeWidth={8} />
                  <circle
                    cx={50}
                    cy={50}
                    r={40}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={8}
                    strokeLinecap="butt"
                    strokeDasharray={`${(2 * Math.PI * 40 * data.adherence28d) / 100} ${2 * Math.PI * 40}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)' }}
                  />
                  <text
                    x={50}
                    y={53}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={accentColor}
                    fontSize={18}
                    fontWeight={900}
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {data.adherence28d}%
                  </text>
                </svg>
                <div>
                  <p
                    className={`text-xs uppercase tracking-widest mb-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    style={mono}
                  >
                    28-Day Adherence
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    style={mono}
                  >
                    {data.sessionsCompleted28d} of {Math.round(data.sessionsCompleted28d / (data.adherence28d / 100 || 1))} planned sessions completed
                  </p>
                  <p
                    className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
                    style={mono}
                  >
                    {data.adherence28d >= 80
                      ? '✓ Excellent consistency'
                      : data.adherence28d >= 60
                      ? '~ Good — aim for 80%+'
                      : '! Needs improvement'}
                  </p>
                </div>
              </div>

              {/* Streak card */}
              <div
                className={`p-5 border flex items-center gap-6 ${
                  isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
                }`}
              >
                <div
                  className={`text-6xl font-black tabular-nums shrink-0 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={mono}
                >
                  <AnimatedCounter value={data.streakDays} />
                </div>
                <div>
                  <p
                    className={`text-xs uppercase tracking-widest mb-1 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}
                    style={mono}
                  >
                    Day Streak
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    style={mono}
                  >
                    {data.streakDays >= 7
                      ? 'Keep it up — you\'re on a roll!'
                      : data.streakDays >= 3
                      ? 'Building momentum...'
                      : 'Start a streak today'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
