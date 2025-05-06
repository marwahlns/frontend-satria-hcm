import Main from "../../../main-layouts/layout-employee";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import LeavePage from "../../transaction/leave-submit"; // ini file komponen leave kamu
import OvertimePage from "../../transaction/leave-submit"; // ini file overtime
import {
  IoIosAirplane,
  IoIosArrowRoundUp,
  IoIosAlarm,
  IoIosBriefcase,
  IoMdCalendar,
  IoIosBusiness,
} from "react-icons/io";

export default function Home() {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const nama = Cookies.get("user_name") || "";
    const department = Cookies.get("user_department") || "";
    setName(nama);
    setDepartment(department);
  }, []);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "leave", label: "Leave" },
    { id: "overtime", label: "Overtime" },
    { id: "travel", label: "Official Travel" },
    { id: "mutation", label: "Mutation" },
    { id: "resign", label: "Resign" },
  ];

  return (
    <Main>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full max-w-3xl sm:max-w-4xl md:max-w-5xl lg:max-w-6xl mx-auto mt-16">
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
          <div className="flex flex-wrap justify-center items-center space-x-2 mt-1 text-sm">
            <span className="text-gray-600">{department}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center flex-wrap gap-4">
          {/* Presence */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoIosArrowRoundUp className="text-green-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Presence</div>
          </div>

          {/* Late In */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoIosAlarm className="text-red-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Late In</div>
          </div>

          {/* Leave */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoMdCalendar className="text-yellow-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Leave</div>
          </div>

          {/* Official Travel */}
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoIosAirplane className="text-blue-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Official Travel</div>
          </div>

          {/* Mutation
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoIosBusiness className="text-purple-500 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Mutation</div>
          </div> */}

          {/* Resign
          <div className="border border-dashed border-gray-300 p-4 rounded-lg text-center w-32">
            <div className="flex items-center justify-center gap-2">
              <IoIosBriefcase className="text-gray-700 text-xl" />
              <div className="text-blue-900 font-bold text-lg">0</div>
            </div>
            <div className="text-gray-500 text-sm mt-1">Resign</div>
          </div> */}
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 w-full justify-center">
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

          {/* Card for Each Tab */}
          <div className="w-full max-w-6xl">
            {activeTab === "overview" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <p>This is the Overview content.</p>
              </div>
            )}

            {activeTab === "overtime" && (
              <div className="bg-grey-500 rounded-lg shadow-md p-6">
                <OvertimePage />
              </div>
            )}

            {activeTab === "leave" && (
              <div className="bg-grey-500 rounded-lg shadow-md p-6">
                <LeavePage />
              </div>
            )}
          </div>
        </div>
      </div>
    </Main>
  );
}
