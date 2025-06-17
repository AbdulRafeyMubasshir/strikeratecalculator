import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './ManagerDashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const COLORS = ['#4caf50', '#f44336'];

function ManagerDashboard({ manager, onLogout }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [filtered, setFiltered] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    let query = supabase.from('kpi_submissions').select('*');

    if (startDateTime) {
      query = query.gte('submitted_at', new Date(startDateTime).toISOString());
    }

    if (endDateTime) {
      query = query.lte('submitted_at', new Date(endDateTime).toISOString());
    }

    query = query.order('submitted_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      alert('Error fetching KPI submissions');
      setLoading(false);
      return;
    }

    let uniqueSubmissions = data;

    if (!startDateTime && !endDateTime) {
      const seenStores = new Set();
      uniqueSubmissions = data.filter((sub) => {
        if (seenStores.has(sub.store_name)) return false;
        seenStores.add(sub.store_name);
        return true;
      });
    }

    const enriched = uniqueSubmissions.map((sub) => {
      const yes = parseFloat(sub.yes_count);
      const no = parseFloat(sub.no_count);
      const total = yes + no;
      const strike = total > 0 ? (yes / total) * 100 : 0;
      const target = parseFloat(sub.target_strike_rate);
      const vsTarget = strike - target;

      return {
        ...sub,
        strike_rate: strike.toFixed(2),
        target_strike_rate: target.toFixed(2),
        vs_target: vsTarget.toFixed(2),
      };
    });

    const sorted = enriched.sort((a, b) => parseFloat(b.vs_target) - parseFloat(a.vs_target));

    setSubmissions(sorted);
    setFiltered(!!startDateTime || !!endDateTime);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const totalSubmissions = submissions.length;
  const totalYes = submissions.reduce((sum, s) => sum + Number(s.yes_count), 0);
  const totalNo = submissions.reduce((sum, s) => sum + Number(s.no_count), 0);
  const averageStrikeRate =
    totalYes + totalNo > 0
      ? ((totalYes / (totalYes + totalNo)) * 100).toFixed(2)
      : '0.00';

  const storesMeetingTarget = submissions.filter(
    (s) => parseFloat(s.strike_rate) >= parseFloat(s.target_strike_rate)
  ).length;

  const storesBelowTarget = totalSubmissions - storesMeetingTarget;

  const pieData = [
    { name: 'Meeting Target', value: storesMeetingTarget },
    { name: 'Below Target', value: storesBelowTarget },
  ];

  const recentSubmissions = submissions.map((s) => ({
    store: s.store_name,
    strikeRate: parseFloat(s.strike_rate),
    targetRate: parseFloat(s.target_strike_rate),
  }));
  

  const exportToExcel = () => {
    if (submissions.length === 0) {
      alert('No data to export');
      return;
    }

    const dataToExport = submissions.map((sub, index) => ({
      Rank: index + 1,
      'Store Name': sub.store_name,
      'Yes Count': sub.yes_count,
      'No Count': sub.no_count,
      'Strike Rate (%)': sub.strike_rate,
      'Target Strike Rate (%)': sub.target_strike_rate,
      'VS Target (%)': sub.vs_target,
      'Additional Yes Needed': sub.additional_yes_needed,
      'Submitted At': new Date(sub.submitted_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KPI Submissions');

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'KPI_Submissions.xlsx');
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <h1>Regional Manager Dashboard</h1>
        <button className="logout-button" onClick={onLogout}>Logout</button>
      </header>

      <div className="filters">
        <label>
          Start Date & Time:
          <input
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
        </label>
        <label>
          End Date & Time:
          <input
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
          />
        </label>
        <button className="filter-button" onClick={fetchSubmissions}>
          Apply Filter
        </button>
      </div>

      <section className="stats-grid">
        <div className="stat-card">
          <h2>{averageStrikeRate}%</h2>
          <p>Region Strike Rate</p>
        </div>
        <div className="stat-card">
          <h2>{storesMeetingTarget}</h2>
          <p>Stores Meeting Target</p>
        </div>
        <div className="stat-card">
          <h2>{storesBelowTarget}</h2>
          <p>Stores Below Target</p>
        </div>
        <div className="stat-card">
          <h2>{totalSubmissions}</h2>
          <p>Total Submissions</p>
        </div>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Stores Strike Rate vs Target</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={recentSubmissions} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="store" />
            <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="strikeRate" fill="#4caf50" name="Strike Rate" />
            <Bar dataKey="targetRate" fill="#2196f3" name="Target Rate" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Stores Meeting Target vs Below Target</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section>
        <h2>KPI Submissions</h2>
        <button className="export-button" onClick={exportToExcel}>
          📥 Download as Excel
        </button>

        {loading && <p>Loading...</p>}
        {!loading && submissions.length === 0 && <p>No submissions found.</p>}

        {!loading && submissions.length > 0 && (
          <table className="kpi-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Store Name</th>
                <th>Yes Count</th>
                <th>No Count</th>
                <th>Strike Rate (%)</th>
                <th>Target Strike Rate (%)</th>
                <th>vs Target (%)</th>
                <th>Additional Yes Needed</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => {
                const metTarget = parseFloat(sub.strike_rate) >= parseFloat(sub.target_strike_rate);
                const isTop3 = index < 3;
                const vsTarget = parseFloat(sub.vs_target);

                return (
                  <tr
                    key={sub.id}
                    className={metTarget ? 'meeting-target' : 'below-target'}
                    style={{
                      backgroundColor: isTop3 ? '#d4edda' : 'transparent',
                    }}
                  >
                    <td>{index + 1}</td>
                    <td>{sub.store_name}</td>
                    <td>{sub.yes_count}</td>
                    <td>{sub.no_count}</td>
                    <td>{sub.strike_rate}</td>
                    <td>{sub.target_strike_rate}</td>
                    <td style={{ color: vsTarget >= 0 ? 'green' : 'red' }}>
                      {vsTarget}%
                    </td>
                    <td>{sub.additional_yes_needed}</td>
                    <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default ManagerDashboard;
