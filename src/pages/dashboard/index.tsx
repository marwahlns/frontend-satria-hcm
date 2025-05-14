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

export default function Home() {
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

  const [activeTab, setActiveTab] = useState("Leave");
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState<number[]>([]);
  const [areaCategories, setAreaCategories] = useState<number[]>([]);
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const areaOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["var(--tw-primary)"],
    },
    xaxis: {
      categories: areaCategories,
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
      title: { text: "Date" },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
      title: { text: "Total Attendance" },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
      },
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const day = w.globals.labels[dataPointIndex];
        const [year, month] = selectedMonth.split("-");
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
        const dayName = dateObj.toLocaleDateString("en-US", {
          weekday: "long",
        });

        const formattedDate = `${dayName}, ${day} ${
          monthNames[Number(month) - 1]
        } ${year}`;
        const value = series[seriesIndex][dataPointIndex];

        return `
          <div style="padding: 8px;">
            <div style="font-weight: bold; margin-bottom: 4px;">${formattedDate}</div>
            <div>Total Attendance: <strong>${value}</strong> Employee</div>
          </div>
        `;
      },
    },
  };

  const areaSeries = [
    {
      name: "Total Attendance",
      data: attendanceData,
    },
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

  useEffect(() => {
    const fetchData = async () => {
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
        setSeriesData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setSeriesData(Array(12).fill(0)); // fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedYear]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/tren-attendance`,
          {
            params: { month: selectedMonth },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;

        const days = data.map((item: any) =>
          Number(item.tanggal.split("-")[2])
        );
        const counts = data.map((item: any) => item.jumlah_kehadiran);

        setAreaCategories(days);
        setAttendanceData(counts);
      } catch (err) {
        console.error("Failed to fetch attendance trend:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedMonth]);

  return (
    <Main>
      {/* CHART ATTENDANCE */}
      <div className="card mt-6">
        <div className="card-header flex items-center justify-between">
          <h3 className="card-title">Employee Attendance Trends</h3>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </div>
        <div className="px-3 py-1">
          {isLoading ? (
            <div className="text-center p-5 text-gray-500">
              Loading chart...
            </div>
          ) : (
            <Chart
              options={areaOptions}
              series={areaSeries}
              type="area"
              height={250}
            />
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
