import { useEffect, useState } from "react";
import Main from "../../../main-layouts/main";
import Image from "next/image";
import Cookies from "js-cookie";
import AttendancePage from "../../attendance/attendance-record";
import LeavePage from "../../submission/leave-submit";
import OvertimePage from "../../submission/overtime-submit";
import OfficialTravelPage from "../../submission/officialTravel-submit";
import ResignPage from "../../submission/resign-submit";
import MutationPage from "../../submission/mutation-submit";
import {
  IoIosAirplane,
  IoIosArrowRoundUp,
  IoIosAlarm,
  IoMdCalendar,
} from "react-icons/io";
import axios from "axios";
import Clock from "@/components/Clock";
import AttendanceModal from "./AttendanceModal";

export default function Home() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [absenMode, setAbsenMode] = useState<"checkin" | "checkout">("checkin");
  const [shiftId, setShiftId] = useState("");
  const [shiftName, setShiftName] = useState("Unassigned shift");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [startIn, setStartIn] = useState("");
  const [endIn, setendIn] = useState("");
  const [startOut, setStartOut] = useState("");
  const [endOut, setEndOut] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [clockInFullStr, setClockInFullStr] = useState("");
  const [clockOutFullStr, setClockOutFullStr] = useState("");
  const [totalPresence, setTotalPresence] = useState("0");
  const [totalLateIn, setTotalLateIn] = useState("0");
  const [totalLeave, setTotalLeave] = useState("0");
  const [totalOfficialTravel, setTotalOfficialTravel] = useState("0");
  const [isRefetch, setIsRefetch] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const openAsCheckIn = () => { setAbsenMode("checkin"); setModalOpen(true); };
  const openAsCheckOut = () => { setAbsenMode("checkout"); setModalOpen(true); };

  const getTimeStatusAndStyling = () => {
    const now = new Date();
    const currentTimeStr = now.toLocaleString('sv-SE').replace(' ', 'T') + '.000Z';
    const dateStr = now.toLocaleString('sv-SE').split(' ')[0];
    const inTimeStr = `${dateStr}T${inTime}:00.000Z`;

    // DALAM RANGE CHECK IN
    if (currentTimeStr > startIn && currentTimeStr < startOut) {
      if (currentTimeStr >= startIn && currentTimeStr <= endIn && !clockIn) {
        if (currentTimeStr >= startIn && currentTimeStr <= inTimeStr && !clockIn) {
          return {
            status: 'on-time-check-in',
            borderColor: 'border-blue-500',
            bgColor: 'bg-blue-100',
            iconClass: 'ki-solid ki-user text-blue-500 text-3xl',
            statusText: '- In',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
            displayTime: '',
            checkIn: true,
            checkOut: false,
          };
        }

        return {
          status: 'can-check-in',
          borderColor: 'border-red-500',
          bgColor: 'bg-red-100',
          iconClass: 'ki-solid ki-user text-red-500 text-3xl',
          statusText: '- In',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          displayTime: '',
          checkIn: true,
          checkOut: false,
        };
      }

      if (clockIn) {
        return {
          status: 'checked-in',
          borderColor: 'border-green-500',
          bgColor: 'bg-green-100',
          iconClass: 'ki-solid ki-user-tick text-success text-3xl',
          statusText: '- In',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          displayTime: clockIn,
          checkIn: false,
          checkOut: false,
        };
      }

      return {
        status: 'late-check-in',
        borderColor: 'border-red-500',
        bgColor: 'bg-red-100',
        iconClass: 'ki-solid ki-user text-red-500 text-3xl',
        statusText: '- In',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        displayTime: '',
        checkIn: false,
        checkOut: false,
      };
    }

    // DALAM RANGE CHECK OUT
    if (currentTimeStr >= startOut && currentTimeStr <= endOut) {
      if (clockOut) {
        return {
          status: 'checked-out',
          borderColor: 'border-green-500',
          bgColor: 'bg-green-100',
          iconClass: 'ki-solid ki-user-tick text-success text-3xl',
          statusText: '- Out',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          displayTime: clockOut,
          checkIn: false,
          checkOut: true,
        };
      }

      return {
        status: 'check-out-time',
        borderColor: 'border-blue-500',
        bgColor: 'bg-blue-100',
        iconClass: 'ki-solid ki-user text-blue-500 text-3xl',
        statusText: '- In',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        displayTime: clockIn,
        checkIn: false,
        checkOut: true,
      };
    }

    // DEFAULT
    return {
      status: 'not-checked-in',
      borderColor: 'border-slate-500',
      bgColor: 'bg-slate-100',
      iconClass: 'ki-solid ki-user text-slate-400 text-3xl',
      statusText: '- Waiting for In Time',
      buttonColor: 'bg-slate-500 hover:bg-slate-600',
      displayTime: '',
      checkIn: false,
      checkOut: false,
    };
  };

  const timeStatus = getTimeStatusAndStyling();
  const currentStatus = timeStatus.status;
  const isCanCheckIn = timeStatus.checkIn;
  const isCanCheckOut = timeStatus.checkOut;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "leave", label: "Leave" },
    { id: "overtime", label: "Overtime" },
    { id: "officialTravel", label: "Official Travel" },
    { id: "mutation", label: "Mutation" },
    { id: "resign", label: "Resign" },
  ];

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(11, 16);
  };

  const formatDateTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 19);
  };

  useEffect(() => {
    const nama = Cookies.get("user_name") || "";
    const department = Cookies.get("user_department") || "";
    setName(nama);
    setDepartment(department);

    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/shift-today`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const result = response.data;

        if (result.success) {
          setShiftId(result.data.id_shift);
          setShiftName(result.data.shift_name);
          setInTime(result.data.in_time_shift);
          setOutTime(result.data.out_time_shift);
          setStartIn(result.data.gt_before_in);
          setendIn(result.data.gt_after_in);
          setStartOut(result.data.gt_before_out);
          setEndOut(result.data.gt_after_out);
          setClockIn(formatTime(result.data.clock_in_today));
          setClockOut(formatTime(result.data.clock_out_today));
          setClockInFullStr(formatDateTime(result.data.clock_in_today));
          setClockOutFullStr(formatDateTime(result.data.clock_out_today));
          setTotalPresence(result.data.total_data_in);
          setTotalLateIn(result.data.total_data_late_in);
          setTotalLeave(result.data.total_data_leave);
          setTotalOfficialTravel(result.data.total_data_official_travel);
        }
      } catch (error) {
        console.error("Error fetching shift data:", error);
      }
    };

    fetchData();
  }, [isRefetch, currentStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (clockIn && clockIn !== "00:00" && clockIn !== "-") {
      if (clockOut && clockOut !== "-") {
        setIsStopwatchRunning(false);
      } else {
        setIsStopwatchRunning(true);
      }
    } else {
      setIsStopwatchRunning(false);
    }
  }, [clockIn, clockOut]);

  return (
    <Main isSidebar={false} isWrapper={false} isFixedContainer={false}>
      <div className="w-full px-0 md:px-2 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 md:col-span-1 overflow-x-auto">
          {/* Card Profil */}
          <div className="flex flex-col items-center text-center bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4">
              <Image
                src="/profile.jpg"
                alt="Profile"
                priority
                fill
                sizes="112px"
                className="rounded-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            <div className="text-sm text-gray-600 mt-1">{department}</div>

            {/* Check In/Out Info */}
            <div
              className={`rounded border border-dashed p-4 mt-4 flex flex-col items-center space-y-2 transition-all duration-300 ${timeStatus.borderColor} ${timeStatus.bgColor}`}
            >
              <div className="flex items-center space-x-3">
                <i className={timeStatus.iconClass}></i>
                <div className="flex items-start flex-col">
                  <span className="text-md font-bold text-gray-800">
                    {timeStatus.displayTime} {timeStatus.statusText}
                  </span>

                  <div className="flex space-x-2 items-center text-sm text-gray-700">
                    <i className="ki-solid ki-sun text-warning"></i>
                    <p className="font-semibold text-xs">{shiftName}</p>
                    <p className="font-semibold text-xs">{inTime}-{outTime}</p>
                  </div>
                </div>
              </div>
            </div>
            <Clock
              isStart={isStopwatchRunning}
              clockInTime={clockInFullStr}
              clockOutTime={clockOutFullStr}
              showControls={false}
            />
            <div className="mt-4">
              {isCanCheckIn && (
                <button
                  className={`text-white px-4 py-2 rounded shadow transition-colors duration-300 ${timeStatus.buttonColor}`}
                  onClick={openAsCheckIn}
                >
                  Start Attendance
                </button>
              )}

              {isCanCheckOut && (
                <button
                  className={`text-white px-4 py-2 rounded shadow transition-colors duration-300 ${timeStatus.buttonColor}`}
                  onClick={openAsCheckOut}
                >
                  Finish Attendance
                </button>
              )}
            </div>
          </div>

          {/* Card Statistik */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            {/* Presence */}
            <div className="border border-dashed border-gray-300 p-4 bg-white rounded-lg text-center w-full">
              <div className="flex items-center justify-center gap-2">
                <IoIosArrowRoundUp className="text-green-500 text-xl" />
                <div className="text-blue-900 font-bold text-lg">
                  {totalPresence}
                </div>
              </div>
              <div className="text-gray-500 text-sm font-semibold mt-1">Presence</div>
            </div>

            {/* Late In */}
            <div className="border border-dashed border-gray-300 p-4 bg-white rounded-lg text-center w-full">
              <div className="flex items-center justify-center gap-2">
                <IoIosAlarm className="text-red-500 text-xl" />
                <div className="text-blue-900 font-bold text-lg">
                  {totalLateIn}
                </div>
              </div>
              <div className="text-gray-500 text-sm font-semibold mt-1">Late In</div>
            </div>

            {/* Leave */}
            <div className="border border-dashed border-gray-300 p-4 bg-white rounded-lg text-center w-full">
              <div className="flex items-center justify-center gap-2">
                <IoMdCalendar className="text-yellow-500 text-xl" />
                <div className="text-blue-900 font-bold text-lg">
                  {totalLeave}
                </div>
              </div>
              <div className="text-gray-500 text-sm font-semibold mt-1">Leave</div>
            </div>

            {/* Official Travel */}
            <div className="border border-dashed border-gray-300 p-4 bg-white rounded-lg text-center w-full">
              <div className="flex items-center justify-center gap-2">
                <IoIosAirplane className="text-blue-500 text-xl" />
                <div className="text-blue-900 font-bold text-lg">
                  {totalOfficialTravel}
                </div>
              </div>
              <div className="text-gray-500 text-sm font-semibold mt-1">Official Travel</div>
            </div>
          </div>
        </div>

        {/* Konten Kanan */}
        <div className="col-span-2 overflow-x-auto">
          <div className="bg-white rounded-2xl p-6 border">
            {/* Tabs */}
            <div className="tabs mb-5 scrollable">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 ${activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && <AttendancePage />}
            {activeTab === "leave" && <LeavePage />}
            {activeTab === "overtime" && <OvertimePage />}
            {activeTab === "officialTravel" && <OfficialTravelPage />}
            {activeTab === "mutation" && <MutationPage />}
            {activeTab === "resign" && <ResignPage />}
          </div>
        </div>
      </div>

      <AttendanceModal
        isModalOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        setRefetch={setIsRefetch}
        isRefetch={isRefetch}
        shiftId={shiftId}
        inTime={inTime}
        startIn={startIn}
        endIn={endIn}
        outTime={outTime}
        startOut={startOut}
        endOut={endOut}
        type={absenMode}
      />
    </Main>
  );
}
