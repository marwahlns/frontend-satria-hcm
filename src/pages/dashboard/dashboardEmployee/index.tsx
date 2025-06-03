import Main from "../../../main-layouts/main";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import LeavePage from "../../transaction/leave-submit";
import OvertimePage from "../../transaction/overtime-submit";
import OfficialTravelPage from "../../transaction/officialTravel-submit";
import ResignPage from "../../transaction/resign-submit";
import MutationPage from "../../transaction/mutation-submit";
import { FiUser, FiClock } from "react-icons/fi";
import {
  useLeaveStore,
  useOfficialTravelStore,
} from "../../../stores/submitStore";
import {
  IoIosAirplane,
  IoIosArrowRoundUp,
  IoIosAlarm,
  IoMdCalendar,
} from "react-icons/io";
import axios from "axios";
import AttendanceModal from "@/components/Modals/AttendanceModal";

export default function Home() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const totalLeaves = useLeaveStore((state) => state.totalLeaves);
  const setTotalLeaves = useLeaveStore((state) => state.setTotalLeaves);
  const totalOfficialTravel = useOfficialTravelStore(
    (state) => state.totalOfficialTravels
  );
  const setTotalOfficialTravel = useOfficialTravelStore(
    (state) => state.setTotalOfficialTravels
  );
  const [absenType, setAbsenType] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [canCheckOut, setCanCheckOut] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "leave", label: "Leave" },
    { id: "overtime", label: "Overtime" },
    { id: "officialTravel", label: "Official Travel" },
    { id: "resign", label: "Resign" },
  ];

  useEffect(() => {
    const nama = Cookies.get("user_name") || "";
    const department = Cookies.get("user_department") || "";
    setName(nama);
    setDepartment(department);

    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        const [response1, response2, response3] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=leave`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/trx?type=officialTravel`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const result1 = response1.data;
        const result2 = response2.data;
        const result3 = response3.data;

        if (result1.success) {
          setTotalLeaves(result1.data.totalItems);
        }

        if (result2.success) {
          setTotalOfficialTravel(result2.data.totalItems);
        }
        if (result3.success) {
          setCanCheckIn(result3.data.canCheckIn);
          setCanCheckOut(result3.data.canCheckOut);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleAbsen = (type) => {
    setAbsenType(type);
  };

  const handleClose = () => {
    setAbsenType(null);
  };

  return (
    <Main isSidebar={false}>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-7xl mx-auto mt-16">
        {/* Profile */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4">
            <Image
              src="/images/jenny.jpg"
              alt="Profile"
              fill
              className="rounded-full border-4 border-green-400 object-cover"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <div className="text-sm text-gray-600 mt-1">{department}</div>
        </div>

        {/* Check In/Out Info */}
        <div className="mt-4 flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2 text-lg font-medium text-gray-700">
            <FiUser className="text-red-500" />
            <span>- In</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <FiClock className="text-yellow-500" />
            <span>UTEOFF</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {canCheckIn && (
              <button
                className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => handleAbsen("checkin")}
              >
                Check In
              </button>
            )}

            {canCheckOut && (
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                onClick={() => handleAbsen("checkout")}
              >
                Check Out
              </button>
            )}

            {!canCheckIn && !canCheckOut && (
              <span className="text-gray-500 font-medium">Sudah absen</span>
            )}
          </div>

          {absenType && <AttendanceModal onClose={handleClose} />}
        </div>

        {/* Summary Boxes */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-items-center">
          {/* Presence */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-full max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <IoIosArrowRoundUp className="text-green-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Presence</div>
          </div>

          {/* Late In */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-full max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <IoIosAlarm className="text-red-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Late In</div>
          </div>

          {/* Leave */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-full max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <IoMdCalendar className="text-yellow-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">
                {totalLeaves}
              </div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Leave</div>
          </div>

          {/* Official Travel */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-full max-w-[120px]">
            <div className="flex items-center justify-center gap-2">
              <IoIosAirplane className="text-blue-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">
                {totalOfficialTravel}
              </div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Official Travel</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col items-center space-y-4 mt-8">
          <div className="flex flex-wrap justify-center gap-4 border-b border-gray-200 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="w-full">
            {activeTab === "overview" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <p>This is the Overview content.</p>
              </div>
            )}
            {activeTab === "leave" && (
              <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <LeavePage />
              </div>
            )}
            {activeTab === "overtime" && (
              <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <OvertimePage />
              </div>
            )}
            {activeTab === "officialTravel" && (
              <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <OfficialTravelPage />
              </div>
            )}
            {activeTab === "resign" && (
              <div className="bg-gray-100 rounded-lg shadow-md p-6">
                <ResignPage />
              </div>
            )}
          </div>
        </div>
      </div>
    </Main>
  );
}
