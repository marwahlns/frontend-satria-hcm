import Main from "../../../main-layouts/main";
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
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [activeTab, setActiveTab] = useState('Leave');
  const [seriesData, setSeriesData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const barOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 250,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: ['#3E97FF'],
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#A1A5B7',
          fontSize: '12px',
        },
      },
      crosshairs: {
        position: 'front',
        stroke: {
          color: '#3E97FF',
          width: 1,
          dashArray: 3,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#A1A5B7',
          fontSize: '12px',
        },
      },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex }) {
        const number = parseInt(series[seriesIndex][dataPointIndex]);
        const month = dataPointIndex;
        const monthName = categories[month];

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
      borderColor: '#E4E6EF',
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    markers: {
      size: 0,
      colors: ['#CFE2FF'],
      strokeColors: '#3E97FF',
      strokeWidth: 4,
      hover: {
        size: 8,
        sizeOffset: 0,
      },
    },
  };

  const areaOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 250,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#0ea5e9"],
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#A1A5B7",
          fontSize: "12px",
        },
      },
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
      y: {
        formatter: (val: number) => `${val} submissions`,
      },
    },
  };

  const areaSeries = [
    {
      name: "Total Submissions",
      data: seriesData.reduce((acc: number[], val: number, i: number) => {
        acc.push((acc[i - 1] || 0) + val);
        return acc;
      }, []),
    },
  ];

  const series = [
    {
      name: 'Transactions',
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
      .split(' ')
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join('');
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const typeParam = toCamelCase(activeTab);
        const token = Cookies.get("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/submission`,
          {
            params: { type: typeParam, year: selectedYear },
            headers: { Authorization: `Bearer ${token}` }
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

  return (
    <Main>
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">
            Employee Attendance Trends
          </h3>
        </div>
        <div className="px-3 py-1">
          <div id="area_chart">
          </div>
        </div>
      </div>

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
            {["Leave", "Overtime", "Official Travel", "Mutation", "Resign"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex flex-col items-center justify-center w-24 h-24 rounded-lg border-2 ${activeTab === tab
                  ? "border-blue-500 bg-white text-blue-600 shadow"
                  : "border-dashed border-gray-200 text-gray-500"
                  }`}
              >
                <div className="mb-2">{tabIcons[tab]}</div>
                <span className="font-semibold text-sm text-center">{tab}</span>
                {activeTab === tab && (
                  <span className="w-full h-[4px] bg-blue-500 rounded-b absolute bottom-0 left-0"></span>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-1">
            {isLoading ? (
              <div className="text-center p-5 text-gray-500">Loading chart...</div>
            ) : (
              <Chart options={barOptions} series={series} type="bar" height={250} />
            )}
          </div>
        </div>
      </div>
    </Main >
  );
}
