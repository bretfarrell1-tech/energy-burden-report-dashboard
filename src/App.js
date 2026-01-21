import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// CORRECTED Q3 2025 Data for all 6 Oregon utilities - Verified against source PDFs
const rawData = {
  utilities: [
    {
      id: "pge",
      name: "Portland General Electric",
      type: "Electric",
      color: "#1E3A5F",
    },
    {
      id: "pacific",
      name: "Pacific Power",
      type: "Electric",
      color: "#DC2626",
    },
    { id: "idaho", name: "Idaho Power", type: "Electric", color: "#059669" },
    { id: "nwn", name: "NW Natural", type: "Gas", color: "#7C3AED" },
    { id: "avista", name: "Avista Utilities", type: "Gas", color: "#0891B2" },
    {
      id: "cascade",
      name: "Cascade Natural Gas",
      type: "Gas",
      color: "#EA580C",
    },
  ],
  months: ["July", "August", "September"],

  // VERIFIED DATA from source PDFs
  arrears: {
    pge: {
      customers: [125609, 126029, 129642],
      balance: [15788242, 16724173, 17596343],
    },
    pacific: {
      customers: [109233, 110018, 108453],
      balance: [30297203, 29846409, 28529091],
    },
    idaho: {
      customers: [1922, 1994, 1944],
      balance: [538700, 539545, 518853],
    },
    nwn: {
      customers: [53545, 57725, 55982],
      balance: [4450767, 4204896, 3791976],
    },
    avista: {
      customers: [10152, 10802, 9996],
      balance: [1130967, 1005687, 851085],
    },
    cascade: {
      customers: [5317, 5543, 5779],
      balance: [412773, 332785, 285775],
    },
  },

  disconnections: {
    pge: {
      total: [3871, 2088, 4081], // CORRECTED - was wrong
      notices: [39534, 39472, 44712],
      accounts: [840707, 841383, 841869],
    },
    pacific: {
      total: [2631, 1882, 2837],
      notices: [42556, 43062, 44265],
      accounts: [527778, 528166, 528315],
    },
    idaho: {
      total: [51, 47, 47],
      notices: [230, 258, 268],
      accounts: [14765, 14808, 14812],
    },
    nwn: {
      total: [1594, 1023, 826],
      notices: [12181, 7664, 7139],
      accounts: [648638, 648421, 648036],
    },
    avista: {
      total: [71, 47, 83],
      notices: [999, 884, 664],
      accounts: [93140, 93110, 93103],
    },
    cascade: {
      total: [46, 26, 30],
      notices: [570, 353, 506],
      accounts: [75141, 75129, 75260],
    },
  },

  billDiscount: {
    pge: {
      participants: [100371, 99848, 101371],
      dollars: [4672513, 4773612, 5068408],
      newEnroll: [2735, 2474, 4050],
    },
    pacific: {
      participants: [71194, 68294, 66673],
      dollars: [2917650, 3002118, 2834532],
      newEnroll: [3073, 2920, 4807],
    },
    idaho: {
      participants: [1408, 1429, 1451],
      dollars: [97433, 103671, 99829],
      newEnroll: [41, 70, 36],
    },
    nwn: {
      participants: [46268, 46007, 46107],
      dollars: [573975, 492952, 507902],
      newEnroll: [1065, 1046, 1124],
    },
    avista: {
      participants: [11145, 10996, 10855],
      dollars: [83328, 75505, 79227],
      newEnroll: [107, 93, 143],
    },
    cascade: {
      participants: [4615, 4620, 4641],
      dollars: [54676, 47743, 50493],
      newEnroll: [105, 81, 107],
    },
  },

  usage: {
    pge: { avgBill: [126.0, 139.0, 102.0], avgUsage: [1040, 889, 814] },
    pacific: { avgBill: [137.05, 146.06, 138.39], avgUsage: [806, 864, 813] },
    idaho: { avgBill: [117.28, 120.14, 111.6], avgUsage: [991, 1016, 943] },
    nwn: { avgBill: [31.1, 27.5, 28.12], avgUsage: [14, 11, 12] },
    avista: { avgBill: [29.0, 27.0, 28.0], avgUsage: [11, 9, 10] },
    cascade: { avgBill: [24.66, 21.34, 22.85], avgUsage: [17, 14, 15] },
  },

  // Arrearage Aging Buckets - 31-60 / 61-90 / 91+ days (VERIFIED from source PDFs)
  // Format: [July, August, September] for each bucket
  arrearsBuckets: {
    pge: {
      // Customers by aging bucket (verified from PGE PDF)
      customers31_60: [83355, 83489, 87462],
      customers61_90: [30348, 29941, 29393],
      customers91plus: [11906, 12599, 12787],
      // Balance by aging bucket (verified from PGE PDF)
      balance31_60: [10078212, 11236346, 12060399],
      balance61_90: [2792245, 2643244, 2692489],
      balance91plus: [2917785, 2844583, 2843455],
    },
    pacific: {
      // Verified from Pacific Power PDF
      customers31_60: [47224, 46772, 50512],
      customers61_90: [22653, 27982, 26607],
      customers91plus: [39356, 35264, 31334],
      balance31_60: [11720519, 12003227, 12787607],
      balance61_90: [5409144, 5965334, 5419016],
      balance91plus: [13167539, 11877848, 10322469],
    },
    idaho: {
      // Verified from Idaho Power PDF
      customers31_60: [918, 1014, 1023],
      customers61_90: [366, 374, 400],
      customers91plus: [638, 606, 521],
      balance31_60: [84168, 107768, 114652],
      balance61_90: [60089, 73298, 83589],
      balance91plus: [394443, 358479, 320612],
    },
    nwn: {
      // Verified from NW Natural PDF
      customers31_60: [25875, 25060, 22018],
      customers61_90: [10218, 13714, 12024],
      customers91plus: [17452, 18951, 21940],
      balance31_60: [1833141, 1555281, 1319720],
      balance61_90: [813701, 964134, 796478],
      balance91plus: [1803925, 1685482, 1675778],
    },
    avista: {
      // Verified from Avista PDF
      customers31_60: [3940, 4366, 3680],
      customers61_90: [1887, 2099, 1880],
      customers91plus: [4325, 4337, 4436],
      balance31_60: [111349, 103730, 83710],
      balance61_90: [127304, 113466, 81182],
      balance91plus: [892314, 788490, 686193],
    },
    cascade: {
      // Verified from Cascade PDF
      customers31_60: [2441, 2577, 2727],
      customers61_90: [1063, 1123, 1098],
      customers91plus: [1813, 1843, 1954],
      balance31_60: [129932, 113062, 103516],
      balance61_90: [86929, 67178, 54892],
      balance91plus: [195912, 152545, 127367],
    },
  },
};

const COLORS = [
  "#1E3A5F",
  "#DC2626",
  "#059669",
  "#7C3AED",
  "#0891B2",
  "#EA580C",
];

const formatCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

const formatNumber = (val) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
};

const KPICard = ({ title, value, subtitle, icon, color = "#1E3A5F" }) => (
  <div
    style={{
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      borderLeft: `4px solid ${color}`,
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "13px",
            color: "#6B7280",
            marginBottom: "8px",
            fontWeight: "500",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827" }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ fontSize: "32px", opacity: 0.2 }}>{icon}</div>
    </div>
  </div>
);

export default function EnergyBurdenDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUtility, setSelectedUtility] = useState("all");
  const [utilityType, setUtilityType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all"); // 'all', 0 (July), 1 (Aug), 2 (Sept)

  const filteredUtilities = useMemo(() => {
    return rawData.utilities.filter((u) => {
      if (utilityType === "all") return true;
      return u.type === utilityType;
    });
  }, [utilityType]);

  // Calculate aggregated metrics
  const totals = useMemo(() => {
    const utilities =
      selectedUtility === "all"
        ? filteredUtilities
        : filteredUtilities.filter((u) => u.id === selectedUtility);

    // If specific month selected, use that index; otherwise sum all or use September (index 2) for single values
    const monthIndices =
      selectedMonth === "all" ? [0, 1, 2] : [parseInt(selectedMonth)];

    let arrearsCust = 0,
      arrearsBalance = 0,
      disconnects = 0,
      discountPart = 0,
      discountDollars = 0,
      totalAccounts = 0;

    utilities.forEach((u) => {
      if (u && rawData.arrears[u.id]) {
        monthIndices.forEach((i) => {
          arrearsCust += rawData.arrears[u.id].customers[i];
          arrearsBalance += rawData.arrears[u.id].balance[i];
          disconnects += rawData.disconnections[u.id].total[i];
          discountPart += rawData.billDiscount[u.id].participants[i];
          discountDollars += rawData.billDiscount[u.id].dollars[i];
          totalAccounts += rawData.disconnections[u.id].accounts[i];
        });
      }
    });

    // For averages, divide by number of months if showing all
    const monthCount = monthIndices.length;

    return {
      arrearsCust:
        selectedMonth === "all"
          ? Math.round(arrearsCust / monthCount)
          : arrearsCust,
      arrearsBalance:
        selectedMonth === "all"
          ? Math.round(arrearsBalance / monthCount)
          : arrearsBalance,
      disconnects, // Keep as sum for disconnections
      discountPart:
        selectedMonth === "all"
          ? Math.round(discountPart / monthCount)
          : discountPart,
      discountDollars, // Keep as sum for dollars
      totalAccounts:
        selectedMonth === "all"
          ? Math.round(totalAccounts / monthCount)
          : totalAccounts,
      monthCount,
    };
  }, [selectedUtility, filteredUtilities, selectedMonth]);

  // Comparison chart data
  const comparisonData = useMemo(() => {
    const monthIdx = selectedMonth === "all" ? 2 : parseInt(selectedMonth); // Default to Sept for 'all'

    return filteredUtilities.map((u) => ({
      name: u.name.split(" ")[0],
      fullName: u.name,
      arrearsCustomers: rawData.arrears[u.id]?.customers[monthIdx] || 0,
      arrearsBalance: rawData.arrears[u.id]?.balance[monthIdx] || 0,
      disconnections: rawData.disconnections[u.id]?.total[monthIdx] || 0,
      discountParticipants:
        rawData.billDiscount[u.id]?.participants[monthIdx] || 0,
      accounts: rawData.disconnections[u.id]?.accounts[monthIdx] || 0,
      color: u.color,
    }));
  }, [filteredUtilities, selectedMonth]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const utilities =
      selectedUtility === "all"
        ? filteredUtilities
        : filteredUtilities.filter((u) => u.id === selectedUtility);

    return rawData.months.map((month, i) => {
      let arrears = 0,
        disconnects = 0,
        discountDollars = 0;
      utilities.forEach((u) => {
        if (u && rawData.arrears[u.id]) {
          arrears += rawData.arrears[u.id].balance[i];
          disconnects += rawData.disconnections[u.id].total[i];
          discountDollars += rawData.billDiscount[u.id].dollars[i];
        }
      });
      return { month, arrears, disconnects, discountDollars };
    });
  }, [selectedUtility, filteredUtilities]);

  // Disconnection rate data
  const disconnectionRates = useMemo(() => {
    const monthIdx = selectedMonth === "all" ? 2 : parseInt(selectedMonth);

    return filteredUtilities.map((u) => {
      const accounts = rawData.disconnections[u.id]?.accounts[monthIdx] || 1;
      const disconnects = rawData.disconnections[u.id]?.total[monthIdx] || 0;
      return {
        name: u.name.split(" ")[0],
        rate: (disconnects / accounts) * 100,
        rateDisplay: ((disconnects / accounts) * 100).toFixed(3),
        disconnects,
        accounts: formatNumber(accounts),
        color: u.color,
      };
    });
  }, [filteredUtilities, selectedMonth]);

  // Helper to get current month label
  const getMonthLabel = () => {
    if (selectedMonth === "all") return "Q3 Avg";
    return rawData.months[parseInt(selectedMonth)];
  };

  // Arrearage aging bucket data
  const agingBucketData = useMemo(() => {
    const monthIdx = selectedMonth === "all" ? 2 : parseInt(selectedMonth);
    const utilities =
      selectedUtility === "all"
        ? filteredUtilities
        : filteredUtilities.filter((u) => u.id === selectedUtility);

    let cust31_60 = 0,
      cust61_90 = 0,
      cust91plus = 0;
    let bal31_60 = 0,
      bal61_90 = 0,
      bal91plus = 0;

    utilities.forEach((u) => {
      if (u && rawData.arrearsBuckets[u.id]) {
        cust31_60 += rawData.arrearsBuckets[u.id].customers31_60[monthIdx];
        cust61_90 += rawData.arrearsBuckets[u.id].customers61_90[monthIdx];
        cust91plus += rawData.arrearsBuckets[u.id].customers91plus[monthIdx];
        bal31_60 += rawData.arrearsBuckets[u.id].balance31_60[monthIdx];
        bal61_90 += rawData.arrearsBuckets[u.id].balance61_90[monthIdx];
        bal91plus += rawData.arrearsBuckets[u.id].balance91plus[monthIdx];
      }
    });

    const totalCust = cust31_60 + cust61_90 + cust91plus;
    const totalBal = bal31_60 + bal61_90 + bal91plus;

    return {
      byCustomers: [
        {
          name: "31-60 Days",
          value: cust31_60,
          percent: ((cust31_60 / totalCust) * 100).toFixed(1),
          color: "#10B981",
        },
        {
          name: "61-90 Days",
          value: cust61_90,
          percent: ((cust61_90 / totalCust) * 100).toFixed(1),
          color: "#F59E0B",
        },
        {
          name: "91+ Days",
          value: cust91plus,
          percent: ((cust91plus / totalCust) * 100).toFixed(1),
          color: "#EF4444",
        },
      ],
      byBalance: [
        {
          name: "31-60 Days",
          value: bal31_60,
          percent: ((bal31_60 / totalBal) * 100).toFixed(1),
          color: "#10B981",
        },
        {
          name: "61-90 Days",
          value: bal61_90,
          percent: ((bal61_90 / totalBal) * 100).toFixed(1),
          color: "#F59E0B",
        },
        {
          name: "91+ Days",
          value: bal91plus,
          percent: ((bal91plus / totalBal) * 100).toFixed(1),
          color: "#EF4444",
        },
      ],
      totals: {
        cust31_60,
        cust61_90,
        cust91plus,
        bal31_60,
        bal61_90,
        bal91plus,
        totalCust,
        totalBal,
      },
    };
  }, [selectedUtility, filteredUtilities, selectedMonth]);

  // Arrearage trend data by utility over time
  const arrearsTrendByUtility = useMemo(() => {
    return rawData.months.map((month, i) => {
      const data = { month };
      filteredUtilities.forEach((u) => {
        data[u.id] = rawData.arrears[u.id].balance[i];
        data[`${u.id}_customers`] = rawData.arrears[u.id].customers[i];
      });
      return data;
    });
  }, [filteredUtilities]);

  // Aging bucket trend over time
  const agingTrendData = useMemo(() => {
    const utilities =
      selectedUtility === "all"
        ? filteredUtilities
        : filteredUtilities.filter((u) => u.id === selectedUtility);

    return rawData.months.map((month, i) => {
      let bal31_60 = 0,
        bal61_90 = 0,
        bal91plus = 0;
      utilities.forEach((u) => {
        if (u && rawData.arrearsBuckets[u.id]) {
          bal31_60 += rawData.arrearsBuckets[u.id].balance31_60[i];
          bal61_90 += rawData.arrearsBuckets[u.id].balance61_90[i];
          bal91plus += rawData.arrearsBuckets[u.id].balance91plus[i];
        }
      });
      return {
        month,
        "31-60 Days": bal31_60,
        "61-90 Days": bal61_90,
        "91+ Days": bal91plus,
      };
    });
  }, [selectedUtility, filteredUtilities]);

  // Per-utility aging breakdown
  const utilityAgingBreakdown = useMemo(() => {
    const monthIdx = selectedMonth === "all" ? 2 : parseInt(selectedMonth);

    return filteredUtilities.map((u) => {
      const buckets = rawData.arrearsBuckets[u.id];
      const totalBal =
        buckets.balance31_60[monthIdx] +
        buckets.balance61_90[monthIdx] +
        buckets.balance91plus[monthIdx];
      const totalCust =
        buckets.customers31_60[monthIdx] +
        buckets.customers61_90[monthIdx] +
        buckets.customers91plus[monthIdx];

      return {
        name: u.name.split(" ")[0],
        fullName: u.name,
        color: u.color,
        bal31_60: buckets.balance31_60[monthIdx],
        bal61_90: buckets.balance61_90[monthIdx],
        bal91plus: buckets.balance91plus[monthIdx],
        cust31_60: buckets.customers31_60[monthIdx],
        cust61_90: buckets.customers61_90[monthIdx],
        cust91plus: buckets.customers91plus[monthIdx],
        totalBal,
        totalCust,
        pct91plus: ((buckets.balance91plus[monthIdx] / totalBal) * 100).toFixed(
          1
        ),
      };
    });
  }, [filteredUtilities, selectedMonth]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "arrears", label: "Arrears" },
    { id: "arrearsTrends", label: "Arrears Trends & Aging" },
    { id: "disconnections", label: "Disconnections" },
    { id: "discount", label: "Bill Discount" },
    { id: "comparison", label: "Utility Comparison" },
    { id: "export", label: "📥 Data Export" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 100%)",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)",
          padding: "24px 32px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700" }}>
            Oregon Energy Burden Metrics Dashboard
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "15px" }}>
            Q3 2025 (July - September) | 6 Utilities | OAR 860-021-0408 | Data
            Verified from Source PDFs
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          padding: "16px 32px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          gap: "24px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "13px",
              color: "#6B7280",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Utility Type
          </label>
          <select
            value={utilityType}
            onChange={(e) => setUtilityType(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              minWidth: "150px",
            }}
          >
            <option value="all">All Types</option>
            <option value="Electric">Electric Only</option>
            <option value="Gas">Gas Only</option>
          </select>
        </div>

        <div>
          <label
            style={{
              fontSize: "13px",
              color: "#6B7280",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Utility
          </label>
          <select
            value={selectedUtility}
            onChange={(e) => setSelectedUtility(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              minWidth: "220px",
            }}
          >
            <option value="all">
              All Utilities ({filteredUtilities.length})
            </option>
            {filteredUtilities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              fontSize: "13px",
              color: "#6B7280",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              minWidth: "150px",
            }}
          >
            <option value="all">All Q3 (Jul-Sep)</option>
            <option value="0">July 2025</option>
            <option value="1">August 2025</option>
            <option value="2">September 2025</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontSize: "13px", color: "#6B7280" }}>
          Total Residential Accounts:{" "}
          <strong>{formatNumber(totals.totalAccounts)}</strong>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "white",
          padding: "0 32px",
          borderBottom: "1px solid #E5E7EB",
          display: "flex",
          gap: "8px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "16px 24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.id ? "600" : "500",
              color: activeTab === tab.id ? "#1E3A5F" : "#6B7280",
              borderBottom:
                activeTab === tab.id
                  ? "3px solid #1E3A5F"
                  : "3px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px" }}
      >
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                title={`Customers in Arrears (${getMonthLabel()})`}
                value={formatNumber(totals.arrearsCust)}
                subtitle={`${(
                  (totals.arrearsCust / totals.totalAccounts) *
                  100
                ).toFixed(1)}% of accounts`}
                icon="📊"
                color="#DC2626"
              />
              <KPICard
                title={`Total Arrears Balance (${getMonthLabel()})`}
                value={formatCurrency(totals.arrearsBalance)}
                subtitle={`Avg ${formatCurrency(
                  totals.arrearsBalance / totals.arrearsCust
                )} per customer`}
                icon="💰"
                color="#EA580C"
              />
              <KPICard
                title={`Disconnections (${
                  selectedMonth === "all" ? "Q3 Total" : getMonthLabel()
                })`}
                value={formatNumber(totals.disconnects)}
                subtitle={
                  selectedMonth === "all"
                    ? "Sum of all 3 months"
                    : `${(
                        (totals.disconnects / totals.totalAccounts) *
                        100
                      ).toFixed(3)}% rate`
                }
                icon="🔌"
                color="#7C3AED"
              />
              <KPICard
                title={`Bill Discount Participants (${getMonthLabel()})`}
                value={formatNumber(totals.discountPart)}
                subtitle={`${(
                  (totals.discountPart / totals.totalAccounts) *
                  100
                ).toFixed(1)}% of accounts`}
                icon="💳"
                color="#059669"
              />
              <KPICard
                title={`Discount Dollars (${
                  selectedMonth === "all" ? "Q3 Total" : getMonthLabel()
                })`}
                value={formatCurrency(totals.discountDollars)}
                subtitle={
                  selectedMonth === "all"
                    ? "Sum of all 3 months"
                    : `Avg ${formatCurrency(
                        totals.discountDollars / totals.discountPart
                      )} per participant`
                }
                icon="💵"
                color="#0891B2"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Monthly Arrears Balance Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="arrears"
                      stroke="#DC2626"
                      fill="#FEE2E2"
                      strokeWidth={2}
                      name="Total Arrears"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Disconnections by Utility (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={comparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      width={80}
                    />
                    <Tooltip
                      formatter={(v) => [formatNumber(v), "Disconnections"]}
                      labelFormatter={(label) =>
                        comparisonData.find((d) => d.name === label)?.fullName
                      }
                    />
                    <Bar dataKey="disconnections" radius={[0, 4, 4, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Arrears Tab */}
        {activeTab === "arrears" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                title={`Total in Arrears (${getMonthLabel()})`}
                value={formatNumber(totals.arrearsCust)}
                icon="👥"
                color="#DC2626"
              />
              <KPICard
                title={`Total Balance (${getMonthLabel()})`}
                value={formatCurrency(totals.arrearsBalance)}
                icon="💰"
                color="#EA580C"
              />
              <KPICard
                title="Avg Balance/Customer"
                value={formatCurrency(
                  totals.arrearsBalance / (totals.arrearsCust || 1)
                )}
                icon="📈"
                color="#7C3AED"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Arrears Balance by Utility (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Bar dataKey="arrearsBalance" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Share of Total Arrears Balance (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comparisonData}
                      dataKey="arrearsBalance"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Arrears Trends & Aging Tab */}
        {activeTab === "arrearsTrends" && (
          <>
            {/* KPI Cards for Aging */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                title={`31-60 Days Balance (${getMonthLabel()})`}
                value={formatCurrency(agingBucketData.totals.bal31_60)}
                subtitle={`${agingBucketData.byBalance[0].percent}% of total`}
                icon="🟢"
                color="#10B981"
              />
              <KPICard
                title={`61-90 Days Balance (${getMonthLabel()})`}
                value={formatCurrency(agingBucketData.totals.bal61_90)}
                subtitle={`${agingBucketData.byBalance[1].percent}% of total`}
                icon="🟡"
                color="#F59E0B"
              />
              <KPICard
                title={`91+ Days Balance (${getMonthLabel()})`}
                value={formatCurrency(agingBucketData.totals.bal91plus)}
                subtitle={`${agingBucketData.byBalance[2].percent}% of total - Highest Risk`}
                icon="🔴"
                color="#EF4444"
              />
              <KPICard
                title="Avg Balance (91+ Days)"
                value={formatCurrency(
                  agingBucketData.totals.bal91plus /
                    (agingBucketData.totals.cust91plus || 1)
                )}
                subtitle={`${formatNumber(
                  agingBucketData.totals.cust91plus
                )} customers`}
                icon="⚠️"
                color="#DC2626"
              />
            </div>

            {/* Aging Distribution Charts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Arrears Balance by Aging Bucket ({getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={agingBucketData.byBalance}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${percent}%`}
                    >
                      {agingBucketData.byBalance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Customers by Aging Bucket ({getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={agingBucketData.byCustomers}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {agingBucketData.byCustomers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Aging Trend Over Time */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Aging Bucket Trend Over Q3 2025
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={agingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="31-60 Days"
                      stackId="1"
                      stroke="#10B981"
                      fill="#D1FAE5"
                    />
                    <Area
                      type="monotone"
                      dataKey="61-90 Days"
                      stackId="1"
                      stroke="#F59E0B"
                      fill="#FEF3C7"
                    />
                    <Area
                      type="monotone"
                      dataKey="91+ Days"
                      stackId="1"
                      stroke="#EF4444"
                      fill="#FEE2E2"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Total Arrears Balance Trend by Utility
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={arrearsTrendByUtility}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Legend />
                    {filteredUtilities.map((u) => (
                      <Line
                        key={u.id}
                        type="monotone"
                        dataKey={u.id}
                        stroke={u.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name={u.name.split(" ")[0]}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Utility Aging Breakdown Table */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  color: "#1E3A5F",
                  fontSize: "16px",
                }}
              >
                Arrears Aging Breakdown by Utility (
                {selectedMonth === "all" ? "September" : getMonthLabel()} 2025)
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#1E3A5F", color: "white" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Utility
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          background: "#10B981",
                        }}
                      >
                        31-60 Days
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          background: "#F59E0B",
                        }}
                      >
                        61-90 Days
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "right",
                          background: "#EF4444",
                        }}
                      >
                        91+ Days
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Total Balance
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        91+ Day %
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Total Customers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilityAgingBreakdown.map((u, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "#F9FAFB" : "white",
                        }}
                      >
                        <td style={{ padding: "12px", fontWeight: "500" }}>
                          {u.fullName}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            background: "#ECFDF5",
                          }}
                        >
                          {formatCurrency(u.bal31_60)}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            background: "#FFFBEB",
                          }}
                        >
                          {formatCurrency(u.bal61_90)}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            background: "#FEF2F2",
                          }}
                        >
                          {formatCurrency(u.bal91plus)}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight: "600",
                          }}
                        >
                          {formatCurrency(u.totalBal)}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          <span
                            style={{
                              background:
                                parseFloat(u.pct91plus) > 40
                                  ? "#FEE2E2"
                                  : parseFloat(u.pct91plus) > 35
                                  ? "#FEF3C7"
                                  : "#D1FAE5",
                              color:
                                parseFloat(u.pct91plus) > 40
                                  ? "#991B1B"
                                  : parseFloat(u.pct91plus) > 35
                                  ? "#92400E"
                                  : "#065F46",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontWeight: "600",
                            }}
                          >
                            {u.pct91plus}%
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {formatNumber(u.totalCust)}
                        </td>
                      </tr>
                    ))}
                    {/* Totals row */}
                    <tr
                      style={{
                        background: "#1E3A5F",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      <td style={{ padding: "12px" }}>TOTAL</td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatCurrency(agingBucketData.totals.bal31_60)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatCurrency(agingBucketData.totals.bal61_90)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatCurrency(agingBucketData.totals.bal91plus)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatCurrency(agingBucketData.totals.totalBal)}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {agingBucketData.byBalance[2].percent}%
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatNumber(agingBucketData.totals.totalCust)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stacked Bar Chart by Utility */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginTop: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  color: "#1E3A5F",
                  fontSize: "16px",
                }}
              >
                Arrears Balance Distribution by Utility (
                {selectedMonth === "all" ? "September" : getMonthLabel()})
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={utilityAgingBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v)}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar
                    dataKey="bal31_60"
                    stackId="a"
                    fill="#10B981"
                    name="31-60 Days"
                  />
                  <Bar
                    dataKey="bal61_90"
                    stackId="a"
                    fill="#F59E0B"
                    name="61-90 Days"
                  />
                  <Bar
                    dataKey="bal91plus"
                    stackId="a"
                    fill="#EF4444"
                    name="91+ Days"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Disconnections Tab */}
        {activeTab === "disconnections" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                title={`Total Disconnections (${
                  selectedMonth === "all" ? "Q3" : getMonthLabel()
                })`}
                value={formatNumber(totals.disconnects)}
                subtitle={
                  selectedMonth === "all"
                    ? "Sum of Jul + Aug + Sep"
                    : "Selected month"
                }
                icon="🔌"
                color="#7C3AED"
              />
              <KPICard
                title={`Disconnection Rate (${
                  selectedMonth === "all" ? "September" : getMonthLabel()
                })`}
                value={`${(
                  (comparisonData.reduce((s, d) => s + d.disconnections, 0) /
                    comparisonData.reduce((s, d) => s + d.accounts, 0)) *
                  100
                ).toFixed(3)}%`}
                subtitle={`Based on ${
                  selectedMonth === "all" ? "September" : getMonthLabel()
                } data`}
                icon="📉"
                color="#0891B2"
              />
              <KPICard
                title="Utilities Reporting"
                value={filteredUtilities.length}
                icon="🏢"
                color="#059669"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Disconnection Rate by Utility (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disconnectionRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v.toFixed(2)}%`}
                    />
                    <Tooltip
                      formatter={(v, name) => [`${v.toFixed(3)}%`, "Rate"]}
                      labelFormatter={(label) => {
                        const item = disconnectionRates.find(
                          (r) => r.name === label
                        );
                        return item
                          ? `${label}: ${item.disconnects.toLocaleString()} disconnections`
                          : label;
                      }}
                    />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {disconnectionRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Monthly Disconnections Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={formatNumber}
                    />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Line
                      type="monotone"
                      dataKey="disconnects"
                      stroke="#7C3AED"
                      strokeWidth={3}
                      dot={{ r: 6 }}
                      name="Total Disconnections"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed table */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginTop: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  color: "#1E3A5F",
                  fontSize: "16px",
                }}
              >
                Disconnection Details by Utility
              </h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead>
                  <tr style={{ background: "#1E3A5F", color: "white" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>
                      Utility
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        background:
                          selectedMonth === "0" ? "#3D6B99" : undefined,
                      }}
                    >
                      July
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        background:
                          selectedMonth === "1" ? "#3D6B99" : undefined,
                      }}
                    >
                      August
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "right",
                        background:
                          selectedMonth === "2" ? "#3D6B99" : undefined,
                      }}
                    >
                      September
                    </th>
                    <th style={{ padding: "12px", textAlign: "right" }}>
                      Q3 Total
                    </th>
                    <th style={{ padding: "12px", textAlign: "right" }}>
                      {selectedMonth === "all" ? "Sept" : getMonthLabel()} Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUtilities.map((u, i) => {
                    const disc = rawData.disconnections[u.id];
                    const q3Total =
                      disc.total[0] + disc.total[1] + disc.total[2];
                    const monthIdx =
                      selectedMonth === "all" ? 2 : parseInt(selectedMonth);
                    const rate = (
                      (disc.total[monthIdx] / disc.accounts[monthIdx]) *
                      100
                    ).toFixed(3);
                    return (
                      <tr
                        key={u.id}
                        style={{
                          background: i % 2 === 0 ? "#F9FAFB" : "white",
                        }}
                      >
                        <td style={{ padding: "12px", fontWeight: "500" }}>
                          {u.name}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight:
                              selectedMonth === "0" ? "600" : undefined,
                            background:
                              selectedMonth === "0" ? "#EEF2FF" : undefined,
                          }}
                        >
                          {disc.total[0].toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight:
                              selectedMonth === "1" ? "600" : undefined,
                            background:
                              selectedMonth === "1" ? "#EEF2FF" : undefined,
                          }}
                        >
                          {disc.total[1].toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "right",
                            fontWeight:
                              selectedMonth === "2" || selectedMonth === "all"
                                ? "600"
                                : undefined,
                            background:
                              selectedMonth === "2" ? "#EEF2FF" : undefined,
                          }}
                        >
                          {disc.total[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {q3Total.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {rate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Bill Discount Tab */}
        {activeTab === "discount" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <KPICard
                title={`Program Participants (${getMonthLabel()})`}
                value={formatNumber(totals.discountPart)}
                subtitle={`${(
                  (totals.discountPart / totals.totalAccounts) *
                  100
                ).toFixed(1)}% of accounts`}
                icon="👥"
                color="#059669"
              />
              <KPICard
                title={`Discounts Applied (${
                  selectedMonth === "all" ? "Q3 Total" : getMonthLabel()
                })`}
                value={formatCurrency(totals.discountDollars)}
                subtitle={
                  selectedMonth === "all"
                    ? "Sum of all 3 months"
                    : "Selected month"
                }
                icon="💵"
                color="#0891B2"
              />
              <KPICard
                title="Avg Discount/Participant"
                value={formatCurrency(
                  totals.discountDollars /
                    (totals.discountPart * (selectedMonth === "all" ? 3 : 1) ||
                      1)
                )}
                subtitle={
                  selectedMonth === "all"
                    ? "Per participant per month"
                    : "Selected month"
                }
                icon="📊"
                color="#7C3AED"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Bill Discount Participants by Utility (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatNumber(v)} />
                    <Bar dataKey="discountParticipants" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Monthly Discount Dollars Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Area
                      type="monotone"
                      dataKey="discountDollars"
                      stroke="#059669"
                      fill="#D1FAE5"
                      strokeWidth={2}
                      name="Discount Dollars"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Comparison Tab */}
        {activeTab === "comparison" && (
          <>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 20px",
                  color: "#1E3A5F",
                  fontSize: "16px",
                }}
              >
                Utility Comparison Matrix -{" "}
                {selectedMonth === "all"
                  ? "September 2025"
                  : `${getMonthLabel()} 2025`}{" "}
                (Verified Data)
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#1E3A5F", color: "white" }}>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Utility
                      </th>
                      <th style={{ padding: "12px", textAlign: "left" }}>
                        Type
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Res. Accounts
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        In Arrears
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Arrears %
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Arrears Balance
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Disconnections
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Disc. Rate
                      </th>
                      <th style={{ padding: "12px", textAlign: "right" }}>
                        Discount Part.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUtilities.map((u, i) => {
                      const monthIdx =
                        selectedMonth === "all" ? 2 : parseInt(selectedMonth);
                      const accounts =
                        rawData.disconnections[u.id].accounts[monthIdx];
                      const arrearsCustomers =
                        rawData.arrears[u.id].customers[monthIdx];
                      const arrearsBalance =
                        rawData.arrears[u.id].balance[monthIdx];
                      const disconnects =
                        rawData.disconnections[u.id].total[monthIdx];
                      const discountPart =
                        rawData.billDiscount[u.id].participants[monthIdx];

                      return (
                        <tr
                          key={u.id}
                          style={{
                            background: i % 2 === 0 ? "#F9FAFB" : "white",
                          }}
                        >
                          <td style={{ padding: "12px", fontWeight: "500" }}>
                            {u.name}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                background:
                                  u.type === "Electric" ? "#DBEAFE" : "#FEF3C7",
                                color:
                                  u.type === "Electric" ? "#1E40AF" : "#92400E",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              {u.type}
                            </span>
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {formatNumber(accounts)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {formatNumber(arrearsCustomers)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {((arrearsCustomers / accounts) * 100).toFixed(1)}%
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {formatCurrency(arrearsBalance)}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              textAlign: "right",
                              fontWeight: "600",
                            }}
                          >
                            {formatNumber(disconnects)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {((disconnects / accounts) * 100).toFixed(3)}%
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            {formatNumber(discountPart)}
                          </td>
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr
                      style={{
                        background: "#1E3A5F",
                        color: "white",
                        fontWeight: "600",
                      }}
                    >
                      <td style={{ padding: "12px" }} colSpan={2}>
                        TOTAL
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatNumber(
                          comparisonData.reduce((s, d) => s + d.accounts, 0)
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatNumber(
                          comparisonData.reduce(
                            (s, d) => s + d.arrearsCustomers,
                            0
                          )
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {(
                          (comparisonData.reduce(
                            (s, d) => s + d.arrearsCustomers,
                            0
                          ) /
                            comparisonData.reduce(
                              (s, d) => s + d.accounts,
                              0
                            )) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatCurrency(
                          comparisonData.reduce(
                            (s, d) => s + d.arrearsBalance,
                            0
                          )
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatNumber(
                          comparisonData.reduce(
                            (s, d) => s + d.disconnections,
                            0
                          )
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {(
                          (comparisonData.reduce(
                            (s, d) => s + d.disconnections,
                            0
                          ) /
                            comparisonData.reduce(
                              (s, d) => s + d.accounts,
                              0
                            )) *
                          100
                        ).toFixed(3)}
                        %
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {formatNumber(
                          comparisonData.reduce(
                            (s, d) => s + d.discountParticipants,
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Market Share by Residential Accounts (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={comparisonData}
                      dataKey="accounts"
                      nameKey="fullName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatNumber(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 20px",
                    color: "#1E3A5F",
                    fontSize: "16px",
                  }}
                >
                  Arrears Rate by Utility (
                  {selectedMonth === "all" ? "September" : getMonthLabel()})
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={comparisonData.map((d) => ({
                      ...d,
                      arrearsRate: (d.arrearsCustomers / d.accounts) * 100,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v.toFixed(0)}%`}
                    />
                    <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                    <Bar dataKey="arrearsRate" radius={[4, 4, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {/* Data Export Tab */}
        {activeTab === "export" && (
          <>
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  color: "#1E3A5F",
                  fontSize: "18px",
                }}
              >
                📥 Download Clean Data
              </h3>
              <p
                style={{
                  margin: "0 0 24px",
                  color: "#6B7280",
                  fontSize: "14px",
                }}
              >
                Export the verified Q3 2025 Energy Burden Metrics data in Excel
                format. All data has been cleaned and organized from the
                original PDF filings.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {/* Complete Dataset Export */}
                <div
                  style={{
                    border: "2px solid #1E3A5F",
                    borderRadius: "12px",
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #F0F7FF 0%, #E8F4FD 100%)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    📊
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "#1E3A5F" }}>
                    Complete Dataset
                  </h4>
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    All metrics for all 6 utilities across July, August, and
                    September 2025. Includes arrears, disconnections, bill
                    discount data, and aging buckets.
                  </p>
                  <ul
                    style={{
                      margin: "0 0 16px",
                      paddingLeft: "20px",
                      fontSize: "12px",
                      color: "#4B5563",
                    }}
                  >
                    <li>Summary sheet with all utilities</li>
                    <li>Individual sheets per utility</li>
                    <li>Arrearage aging breakdown (31-60/61-90/91+ days)</li>
                    <li>Monthly trend data</li>
                  </ul>
                  <button
                    onClick={() => {
                      // Generate CSV data for complete dataset
                      let csv =
                        "Oregon Energy Burden Metrics - Q3 2025 Complete Dataset\n\n";
                      csv += "SUMMARY BY UTILITY AND MONTH\n";
                      csv +=
                        "Utility,Type,Month,Residential Accounts,Customers in Arrears,Arrears Balance,31-60 Day Balance,61-90 Day Balance,91+ Day Balance,Disconnections,Disconnection Rate,Bill Discount Participants,Discount Dollars\n";

                      rawData.utilities.forEach((u) => {
                        rawData.months.forEach((month, i) => {
                          const accounts =
                            rawData.disconnections[u.id].accounts[i];
                          const arrearsCust =
                            rawData.arrears[u.id].customers[i];
                          const arrearsBal = rawData.arrears[u.id].balance[i];
                          const bal31_60 =
                            rawData.arrearsBuckets[u.id].balance31_60[i];
                          const bal61_90 =
                            rawData.arrearsBuckets[u.id].balance61_90[i];
                          const bal91plus =
                            rawData.arrearsBuckets[u.id].balance91plus[i];
                          const disconnects =
                            rawData.disconnections[u.id].total[i];
                          const discRate = (
                            (disconnects / accounts) *
                            100
                          ).toFixed(4);
                          const discPart =
                            rawData.billDiscount[u.id].participants[i];
                          const discDollars =
                            rawData.billDiscount[u.id].dollars[i];
                          csv += `${u.name},${u.type},${month} 2025,${accounts},${arrearsCust},${arrearsBal},${bal31_60},${bal61_90},${bal91plus},${disconnects},${discRate}%,${discPart},${discDollars}\n`;
                        });
                      });

                      csv += "\n\nARREARAGE AGING DETAIL\n";
                      csv +=
                        "Utility,Month,31-60 Day Customers,61-90 Day Customers,91+ Day Customers,31-60 Day Balance,61-90 Day Balance,91+ Day Balance\n";
                      rawData.utilities.forEach((u) => {
                        rawData.months.forEach((month, i) => {
                          const b = rawData.arrearsBuckets[u.id];
                          csv += `${u.name},${month} 2025,${b.customers31_60[i]},${b.customers61_90[i]},${b.customers91plus[i]},${b.balance31_60[i]},${b.balance61_90[i]},${b.balance91plus[i]}\n`;
                        });
                      });

                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Oregon_Energy_Burden_Q3_2025_Complete.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#1E3A5F",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Download Complete Dataset (CSV)
                  </button>
                </div>

                {/* Arrears Data Export */}
                <div
                  style={{
                    border: "2px solid #DC2626",
                    borderRadius: "12px",
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    💰
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "#DC2626" }}>
                    Arrearage Data
                  </h4>
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    Detailed arrearage information including aging buckets
                    (31-60, 61-90, 91+ days) for customers and balances.
                  </p>
                  <ul
                    style={{
                      margin: "0 0 16px",
                      paddingLeft: "20px",
                      fontSize: "12px",
                      color: "#4B5563",
                    }}
                  >
                    <li>Total customers in arrears</li>
                    <li>Total arrears balances</li>
                    <li>Aging bucket breakdowns</li>
                    <li>Month-over-month trends</li>
                  </ul>
                  <button
                    onClick={() => {
                      let csv =
                        "Oregon Energy Burden Metrics - Arrearage Data Q3 2025\n\n";
                      csv +=
                        "Utility,Type,Month,Total Customers in Arrears,Total Arrears Balance,31-60 Day Customers,61-90 Day Customers,91+ Day Customers,31-60 Day Balance,61-90 Day Balance,91+ Day Balance,Avg Balance per Customer\n";

                      rawData.utilities.forEach((u) => {
                        rawData.months.forEach((month, i) => {
                          const arrearsCust =
                            rawData.arrears[u.id].customers[i];
                          const arrearsBal = rawData.arrears[u.id].balance[i];
                          const b = rawData.arrearsBuckets[u.id];
                          const avgBal = (arrearsBal / arrearsCust).toFixed(2);
                          csv += `${u.name},${u.type},${month} 2025,${arrearsCust},${arrearsBal},${b.customers31_60[i]},${b.customers61_90[i]},${b.customers91plus[i]},${b.balance31_60[i]},${b.balance61_90[i]},${b.balance91plus[i]},${avgBal}\n`;
                        });
                      });

                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Oregon_Arrearage_Data_Q3_2025.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#DC2626",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Download Arrearage Data (CSV)
                  </button>
                </div>

                {/* Disconnections Export */}
                <div
                  style={{
                    border: "2px solid #7C3AED",
                    borderRadius: "12px",
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    🔌
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "#7C3AED" }}>
                    Disconnection Data
                  </h4>
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    Service disconnections for non-payment, notices sent, and
                    disconnection rates by utility.
                  </p>
                  <ul
                    style={{
                      margin: "0 0 16px",
                      paddingLeft: "20px",
                      fontSize: "12px",
                      color: "#4B5563",
                    }}
                  >
                    <li>Total residential accounts</li>
                    <li>Disconnections for non-payment</li>
                    <li>Disconnection notices sent</li>
                    <li>Disconnection rates</li>
                  </ul>
                  <button
                    onClick={() => {
                      let csv =
                        "Oregon Energy Burden Metrics - Disconnection Data Q3 2025\n\n";
                      csv +=
                        "Utility,Type,Month,Residential Accounts,Disconnections,Disconnection Notices,Disconnection Rate (%)\n";

                      rawData.utilities.forEach((u) => {
                        rawData.months.forEach((month, i) => {
                          const d = rawData.disconnections[u.id];
                          const rate = (
                            (d.total[i] / d.accounts[i]) *
                            100
                          ).toFixed(4);
                          csv += `${u.name},${u.type},${month} 2025,${d.accounts[i]},${d.total[i]},${d.notices[i]},${rate}\n`;
                        });
                      });

                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Oregon_Disconnection_Data_Q3_2025.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#7C3AED",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Download Disconnection Data (CSV)
                  </button>
                </div>

                {/* Bill Discount Export */}
                <div
                  style={{
                    border: "2px solid #059669",
                    borderRadius: "12px",
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)",
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "12px" }}>
                    💳
                  </div>
                  <h4 style={{ margin: "0 0 8px", color: "#059669" }}>
                    Bill Discount Program Data
                  </h4>
                  <p
                    style={{
                      margin: "0 0 16px",
                      fontSize: "13px",
                      color: "#6B7280",
                    }}
                  >
                    Bill discount program participation and dollars provided to
                    low-income customers.
                  </p>
                  <ul
                    style={{
                      margin: "0 0 16px",
                      paddingLeft: "20px",
                      fontSize: "12px",
                      color: "#4B5563",
                    }}
                  >
                    <li>Program participants</li>
                    <li>Discount dollars provided</li>
                    <li>New enrollments</li>
                    <li>Average discount per participant</li>
                  </ul>
                  <button
                    onClick={() => {
                      let csv =
                        "Oregon Energy Burden Metrics - Bill Discount Program Data Q3 2025\n\n";
                      csv +=
                        "Utility,Type,Month,Participants,Discount Dollars,New Enrollments,Avg Discount per Participant\n";

                      rawData.utilities.forEach((u) => {
                        rawData.months.forEach((month, i) => {
                          const b = rawData.billDiscount[u.id];
                          const avgDisc = (
                            b.dollars[i] / b.participants[i]
                          ).toFixed(2);
                          csv += `${u.name},${u.type},${month} 2025,${b.participants[i]},${b.dollars[i]},${b.newEnroll[i]},${avgDisc}\n`;
                        });
                      });

                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "Oregon_Bill_Discount_Data_Q3_2025.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Download Bill Discount Data (CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* Data Preview Section */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  color: "#1E3A5F",
                  fontSize: "16px",
                }}
              >
                📋 Data Preview - September 2025 Summary
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#F3F4F6" }}>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "left",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        Utility
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        Accounts
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        In Arrears
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        Arrears Bal.
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        31-60 Days
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        61-90 Days
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        91+ Days
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        Disconnects
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          textAlign: "right",
                          borderBottom: "2px solid #E5E7EB",
                        }}
                      >
                        Disc. Part.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.utilities.map((u, i) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: "1px solid #E5E7EB" }}
                      >
                        <td style={{ padding: "10px", fontWeight: "500" }}>
                          {u.name}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {rawData.disconnections[
                            u.id
                          ].accounts[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {rawData.arrears[u.id].customers[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          ${rawData.arrears[u.id].balance[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          $
                          {rawData.arrearsBuckets[
                            u.id
                          ].balance31_60[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          $
                          {rawData.arrearsBuckets[
                            u.id
                          ].balance61_90[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          $
                          {rawData.arrearsBuckets[
                            u.id
                          ].balance91plus[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {rawData.disconnections[
                            u.id
                          ].total[2].toLocaleString()}
                        </td>
                        <td style={{ padding: "10px", textAlign: "right" }}>
                          {rawData.billDiscount[
                            u.id
                          ].participants[2].toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "12px",
                  color: "#9CA3AF",
                  fontStyle: "italic",
                }}
              >
                * This is a preview of September 2025 data. Download the
                complete dataset for all months and additional metrics.
              </p>
            </div>

            {/* Data Notes */}
            <div
              style={{
                background: "#FFFBEB",
                borderRadius: "12px",
                padding: "20px",
                marginTop: "24px",
                border: "1px solid #FCD34D",
              }}
            >
              <h4
                style={{
                  margin: "0 0 12px",
                  color: "#92400E",
                  fontSize: "14px",
                }}
              >
                📝 Data Notes
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  color: "#78350F",
                }}
              >
                <li>
                  <strong>Source:</strong> Oregon PUC Docket RO 16 - Energy
                  Burden Metrics Reports (OAR 860-021-0408)
                </li>
                <li>
                  <strong>Period:</strong> Q3 2025 (July, August, September)
                </li>
                <li>
                  <strong>Utilities:</strong> Portland General Electric, Pacific
                  Power, Idaho Power, NW Natural, Avista Utilities, Cascade
                  Natural Gas
                </li>
                <li>
                  <strong>Arrearage Aging:</strong> Customers are counted in one
                  bucket based on their oldest arrearage balance
                </li>
                <li>
                  <strong>Disconnection Rate:</strong> Calculated as
                  (disconnections / residential accounts) × 100
                </li>
                <li>
                  <strong>Format:</strong> CSV files can be opened in Excel,
                  Google Sheets, or any spreadsheet application
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "32px",
            padding: "16px",
            background: "white",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#6B7280",
            textAlign: "center",
          }}
        >
          <strong>Data Source:</strong> Oregon PUC Docket RO 16 - Energy Burden
          Metrics Reports | Q3 2025 (July - September)
          <br />
          Utilities: Portland General Electric, Pacific Power, Idaho Power, NW
          Natural, Avista Utilities, Cascade Natural Gas
          <br />
          <em>Data verified directly from source PDF filings</em>
        </div>
      </div>
    </div>
  );
}
