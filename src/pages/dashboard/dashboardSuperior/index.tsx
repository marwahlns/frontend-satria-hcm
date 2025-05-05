import Main from "../../../main-layouts/main";
import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function Home() {
  const data = [75, 25, 45, 15, 85, 35, 70, 25, 35, 15, 45, 30];
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height: 250,
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: ['#3E97FF'], // ganti var(--tw-primary) dengan warna langsung
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
      max: 100,
      tickAmount: 5,
      axisTicks: { show: false },
      labels: {
        style: {
          colors: '#A1A5B7',
          fontSize: '12px',
        },
        formatter: (value) => `$${value}K`,
      },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex, dataPointIndex, w }) {
        const number = parseInt(series[seriesIndex][dataPointIndex]) * 1000;
        const month = dataPointIndex;
        const monthName = categories[month];

        const formattedNumber = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(number);

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-2sm text-gray-600">
              ${monthName}, 2024 Sales
            </div>
            <div class="flex items-center gap-1.5">
              <div class="font-semibold text-md text-gray-900">
                ${formattedNumber}
              </div>
              <span class="badge badge-outline badge-success badge-xs">
                +24%
              </span>
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

  const series = [
    {
      name: 'Sales',
      data: data,
    },
  ];

  return (
    <Main>
      <div className="mb-6">
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-3xl font-bold text-gray-800">DASHBOARD SUPERIOR</h1>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Area Chart</h3>
          <button className="btn btn-sm btn-icon btn-light btn-clear">
            <i className="ki-outline ki-dots-vertical"></i>
          </button>
        </div>
        <div className="px-3 py-1">
          {/* Gantikan div ini dengan Chart langsung */}
          <Chart options={options} series={series} type="area" height={250} />
        </div>
      </div>
    </Main>
  );
}
