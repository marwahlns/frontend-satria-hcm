import Main from "@/main-layouts/main";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import Cookies from "js-cookie";
import {
  IoIosAirplane,
  IoIosAlarm,
  IoIosBriefcase,
  IoMdCalendar,
  IoIosBusiness,
} from "react-icons/io";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AttendanceStats {
  summary: {
    statsData: {
      onTime: {
        title: string;
        subtitle: string;
        percentage: string;
        count: number;
        total: number;
        percentage_value: number;
      };
      late: {
        title: string;
        subtitle: string;
        percentage: string;
        count: number;
        total: number;
        percentage_value: number;
      };
      earlyOut: {
        title: string;
        subtitle: string;
        percentage: string;
        count: number;
        total: number;
        percentage_value: number;
      };
      lateAndEarly: {
        title: string;
        subtitle: string;
        percentage: string;
        count: number;
        total: number;
        percentage_value: number;
      };
      absent: {
        title: string;
        subtitle: string;
        percentage: string;
        count: number;
        total: number;
        percentage_value: number;
      };
    },
    total_employees: string,
    working_days: string,
    expected_attendance: string,
    actual_attendance: string,
  };
}

interface MonthlyAttendanceData {
  month: string;
  onTime: number;
  late: number;
  earlyOut: number;
  lateAndEarly: number;
  absent: number;
  expected: number;
}

interface InnerData {
  summary: any;
  chart: MonthlyAttendanceData[];
}

interface OuterData {
  data: InnerData;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: OuterData;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Leave");
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const today = new Date();


  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  //TREND SUBMISSION
  const barCategories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const barOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 250,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      show: true,
      width: 1,
      colors: ["#3E97FF"],
    },
    xaxis: {
      categories: barCategories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
      crosshairs: {
        position: "front",
        stroke: {
          color: "#3E97FF",
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: false,
      },
      title: { text: "Month" },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
      title: { text: "Total Submission" },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex }) {
        const number = parseInt(series[seriesIndex][dataPointIndex]);
        const month = dataPointIndex;
        const monthName = barCategories[month];

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-2sm text-gray-600">
              ${monthName}, ${selectedYear} Transactions
            </div>
            <div class="flex items-center gap-1.5">
              <div class="font-semibold text-md text-gray-900">
                ${number} submissions
              </div>
            </div>
          </div>
        `;
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.25,
        opacityTo: 0,
      },
    },
    grid: {
      borderColor: "#E4E6EF",
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    markers: {
      size: 0,
      colors: ["#CFE2FF"],
      strokeColors: "#3E97FF",
      strokeWidth: 4,
      hover: {
        size: 8,
        sizeOffset: 0,
      },
    },
  };

  const barSeries = [
    {
      name: "Transactions",
      data: seriesData,
    },
  ];

  const tabIcons: Record<string, JSX.Element> = {
    Leave: <IoMdCalendar className="text-2xl" />,
    Overtime: <IoIosAlarm className="text-2xl" />,
    "Official Travel": <IoIosAirplane className="text-2xl" />,
    Mutation: <IoIosBusiness className="text-2xl" />,
    Resign: <IoIosBriefcase className="text-2xl" />,
  };

  const toCamelCase = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  };

  const fetchDataTrendSubmission = async () => {
    setIsLoading(true);
    try {
      const typeParam = toCamelCase(activeTab);
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/tren-submission`,
        {
          params: { type: typeParam, year: selectedYear },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSeriesData(response.data.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSeriesData(Array(12).fill(0));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTrendSubmission();
  }, [activeTab, selectedYear]);

  //CARD
  const fetchAttendanceStats = async (month: string) => {
    setStatsLoading(true);
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/summary-by-month`,
        {
          params: { month },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAttendanceStats(response.data.data.data);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      setAttendanceStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStats(selectedMonth);
  }, [selectedMonth]);

  const defaultCardData = [
    {
      title: "Loading...",
      subtitle: "On Time --%",
      percentage: "0%",
      year: "2024",
      bgColor: "bg-[#2780e3]",
      icon: <i className="ki-solid ki-user-tick text-2xl"></i>,
      trend: "up"
    },
    {
      title: "Loading...",
      subtitle: "Late In --%",
      percentage: "0%",
      year: "2024",
      bgColor: "bg-[#3fb618]",
      icon: <i className="ki-solid ki-time text-2xl"></i>,
      trend: "neutral"
    },
    {
      title: "Loading...",
      subtitle: "Early Out --%",
      percentage: "0%",
      year: "2024",
      bgColor: "bg-[#fe7418]",
      icon: <i className="ki-solid ki-exit-right text-2xl"></i>,
      trend: "down"
    },
    {
      title: "Loading...",
      subtitle: "Late & Early --%",
      percentage: "0%",
      year: "2024",
      bgColor: "bg-[#ff0039]",
      icon: <i className="ki-solid ki-information text-2xl"></i>,
      trend: "down"
    },
    {
      title: "Loading...",
      subtitle: "Absence --%",
      percentage: "0%",
      year: "2024",
      bgColor: "bg-[#6c757d]",
      icon: <i className="ki-solid ki-cross-circle text-2xl"></i>,
      trend: "up"
    }
  ];

  const cardData = attendanceStats ? [
    {
      title: attendanceStats.summary.statsData.onTime.title,
      subtitle: attendanceStats.summary.statsData.onTime.subtitle,
      percentage: attendanceStats.summary.statsData.onTime.percentage,
      bgColor: "bg-[#2780e3]",
      icon: <i className="ki-solid ki-user-tick text-2xl"></i>,
      trend: "up"
    },
    {
      title: attendanceStats.summary.statsData.late.title,
      subtitle: attendanceStats.summary.statsData.late.subtitle,
      percentage: attendanceStats.summary.statsData.late.percentage,
      bgColor: "bg-[#3fb618]",
      icon: <i className="ki-solid ki-time text-2xl"></i>,
      trend: "neutral"
    },
    {
      title: attendanceStats.summary.statsData.earlyOut.title,
      subtitle: attendanceStats.summary.statsData.earlyOut.subtitle,
      percentage: attendanceStats.summary.statsData.earlyOut.percentage,
      bgColor: "bg-[#fe7418]",
      icon: <i className="ki-solid ki-exit-right text-2xl"></i>,
      trend: "down"
    },
    {
      title: attendanceStats.summary.statsData.lateAndEarly.title,
      subtitle: attendanceStats.summary.statsData.lateAndEarly.subtitle,
      percentage: attendanceStats.summary.statsData.lateAndEarly.percentage,
      bgColor: "bg-[#ff0039]",
      icon: <i className="ki-solid ki-information text-2xl"></i>,
      trend: "up"
    },
    {
      title: attendanceStats.summary.statsData.absent.title,
      subtitle: attendanceStats.summary.statsData.absent.subtitle,
      percentage: attendanceStats.summary.statsData.absent.percentage,
      bgColor: "bg-[#6c757d]",
      icon: <i className="ki-solid ki-cross-circle text-2xl"></i>,
      trend: "up"
    }
  ] : defaultCardData;

  const getTrendIcon = (trend: string, percentage: string) => {
    if (trend === "neutral" || percentage === "0%") {
      return "=";
    }
    return trend === "up" ? "↗" : "↘";
  };

  //TREND ATTENDANCE
  const [attendanceBarSeries, setAttendanceBarSeries] = useState<ApexAxisChartSeries>([]);
  const attendanceChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 400,
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          total: {
            enabled: false,
            style: {
              fontSize: '13px',
              fontWeight: 900
            }
          }
        }
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      categories: barCategories,
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: function (max) {
        return max;
      },
      tickAmount: 9,
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
        formatter: (val) => val.toFixed(0)
      },
      forceNiceScale: false,
    },
    fill: {
      opacity: 1,
    },
    colors: [
      "#2780e3",
      "#3fb618",
      "#fe7418",
      "#ff0039",
      "#6c757d"
    ],
    legend: {
      position: 'top',
      height: 20,
      horizontalAlign: 'center',
      itemMargin: {
        horizontal: 10,
        vertical: 0
      },
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      intersect: true,
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const monthName = w.globals.labels[dataPointIndex];
        const seriesName = w.globals.seriesNames[seriesIndex];
        const value = series[seriesIndex][dataPointIndex];

        let color = '';
        switch (seriesName) {
          case "On Time":
            color = "#2780e3";
            break;
          case "Late In":
            color = "#3fb618";
            break;
          case "Early Out":
            color = "#fe7418";
            break;
          case "Late & Early":
            color = "#ff0039";
            break;
          case "Absence":
            color = "#6c757d";
            break;
          default:
            color = "#000";
        }

        return `
        <div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 4px;">${monthName}, ${new Date().getFullYear()}</div>
          <div style="display: flex; align-items: center; white-space: nowrap;">
            <span style="color:${color}; margin-right: 4px;">&#9632;</span>
            <span>${seriesName}: <strong>${value}</strong></span>
          </div>
        </div>
      `;
      },
    },
    grid: {
      borderColor: "#E4E6EF",
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: true } },
    },
  };

  const fetchAttendanceBarData = async (year: number) => {
    setIsLoading(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/summary-by-month`,
        {
          params: { year: year },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const apiData = res.data.data.data.chart;

      const onTimeData = apiData.map(item => item.onTime || 0);
      const lateData = apiData.map(item => item.late || 0);
      const earlyOutData = apiData.map(item => item.earlyOut || 0);
      const lateAndEarlyData = apiData.map(item => item.lateAndEarly || 0);
      const absentData = apiData.map(item => item.absent || 0);

      setAttendanceBarSeries([
        { name: "On Time", data: onTimeData },
        { name: "Late In", data: lateData },
        { name: "Early Out", data: earlyOutData },
        { name: "Late & Early", data: lateAndEarlyData },
        { name: "Absence", data: absentData },
      ]);

    } catch (err) {
      console.error("Failed to fetch attendance bar data:", err);
      setAttendanceBarSeries([
        { name: "On Time", data: Array(12).fill(0) },
        { name: "Late In", data: Array(12).fill(0) },
        { name: "Early Out", data: Array(12).fill(0) },
        { name: "Late & Early", data: Array(12).fill(0) },
        { name: "Absence", data: Array(12).fill(0) },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceBarData(selectedYear);
  }, [selectedYear]);

  return (
    <Main>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {cardData.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} card text-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${statsLoading ? 'animate-pulse' : ''
              }`}
          >
            <div className="card-body card-stats p-4 flex justify-between">
              <div className="description">
                <h3 className="text-lg font-bold mb-1">{card.title}</h3>
                <p className="text-white/90 text-sm font-medium">{card.subtitle}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                {card.icon}
              </div>
            </div>            
          </div>
        ))}
      </div>

      {/* CHART ATTENDANCE */}
      <div className="card mt-6">
        <div className="card-header flex items-center justify-between">
          <h3 className="card-title">Employee Attendance Trends</h3>
        </div>
        <div className="px-3 pt-3">
          {isLoading ? (
            <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-70 z-10 flex items-center justify-center">
              <div className="flex items-center space-x-2 text-white bg-slate-500 px-4 py-2 rounded">
                <i className="ki-outline ki-setting-2 animate-spin text-md"></i>
                <span>Loading attendance chart...</span>
              </div>
            </div>
          ) : (
              <div>
                <Chart
                  options={attendanceChartOptions}
                  series={attendanceBarSeries}
                  type="bar"
                  height={400}
                />
              </div>
          )}
        </div>
      </div>

      {/* CHART SUBMISSION */}
      <div className="card mt-6">
        <div className="card-header flex justify-between items-center">
          <h3 className="card-title">Employee Submission Trends</h3>
          <select
            className="select select-sm select-bordered w-32"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div className="card-body">
          <div className="flex space-x-4 mb-4">
            {["Leave", "Overtime", "Official Travel", "Mutation", "Resign"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 ${
                    activeTab === tab
                      ? "border-blue-500 bg-white text-blue-600 shadow"
                      : "border-dashed border-gray-200 text-gray-500"
                  }`}
                >
                  <div className="mb-2">{tabIcons[tab]}</div>
                  <span className="font-semibold text-sm text-center">
                    {tab}
                  </span>
                  {activeTab === tab && (
                    <span className="w-full h-[4px] bg-blue-500 rounded-b absolute bottom-0 left-0"></span>
                  )}
                </button>
              )
            )}
          </div>
          <div className="px-3 py-1">
            {isLoading ? (
              <div className="text-center p-5 text-gray-500">
                Loading chart...
              </div>
            ) : (
              <Chart
                options={barOptions}
                series={barSeries}
                type="bar"
                height={250}
              />
            )}
          </div>
        </div>
      </div>
    </Main>
  );
}