import Main from '@/main-layouts/main';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import FsLightbox from 'fslightbox-react';
import Image from 'next/image';

interface AttendanceRecord {
  id: number;
  in_time: string;
  is_late: number;
  out_time: string | null;
  foto_in: string;
  foto_out: string | null;
  longitude_in: string;
  latitude_in: string;
  longitude_out: string | null;
  latitude_out: string | null;
  MsUser: {
    photo: string;
    name: string;
    personal_number: string;
  };
  MsShift: {
    id: number;
    name: string;
    in_time: string;
    out_time: string;
  }
}

interface UserDetail {
  id: number;
  name: string;
  personal_number: string;
  email: string;
  photo: string;
  address: string;
  division: string;
  department: string;
  company_name: string;
  user_detail?: {
    id: number;
    user_id: number;
    nrp: string;
    name: string;
    email: string;
    marital_status: number;
    gender: string;
    birth_date: string;
    address: string;
    plant: string;
    join_date: string;
    end_date: string;
    status?: number;
    MsMarital?: {
      code: string;
      ket: string;
    };
    MsKlasifikasi?: {
      name: string;
    };
    MsVendor?: {
      name: string;
    };
  }[];
}

interface ApiResponse {
  success: boolean;
  data: {
    data: {
      userData: UserDetail;
      attendanceHistory: AttendanceRecord[];
    }
  };
}

export default function AttendanceDetail() {
  const router = useRouter();
  const { date, user_id } = router.query;

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [lightboxToggler, setLightboxToggler] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (typeof date === 'string' && !isNaN(Date.parse(date))) {
      return new Date(date).getMonth();
    }
    return new Date().getMonth();
  });
  const [userData, setUserDetail] = useState<UserDetail | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    setLightboxToggler(!lightboxToggler);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  function formatTime(dateString: string): string {
    const date = new Date(dateString);

    const pad = (n: number) => n.toString().padStart(2, "0");

    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());

    return `${hours}:${minutes}`;
  }

  const months = [
    { name: "Jan", value: 0 },
    { name: "Feb", value: 1 },
    { name: "Mar", value: 2 },
    { name: "Apr", value: 3 },
    { name: "May", value: 4 },
    { name: "Jun", value: 5 },
    { name: "Jul", value: 6 },
    { name: "Aug", value: 7 },
    { name: "Sep", value: 8 },
    { name: "Oct", value: 9 },
    { name: "Nov", value: 10 },
    { name: "Dec", value: 11 }
  ];

  const fetchAttendanceByMonth = useCallback(async (month: number) => {
    if (!user_id) return;

    setAttendanceLoading(true);
    setAttendanceData([]);

    try {
      const token = Cookies.get("token");

      const currentYear = new Date().getFullYear();
      const monthParam = `${currentYear}-${(month + 1).toString().padStart(2, '0')}`;

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/daily`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            detail: true,
            user_id: user_id,
            date: monthParam,
          }
        }
      );

      if (response.data.success) {
        const { attendanceHistory } = response.data.data.data;
        setAttendanceData(attendanceHistory || []);
      } else {
        console.error('Failed to fetch attendance data');
        setAttendanceData([]);
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setAttendanceData([]);
    } finally {
      setAttendanceLoading(false);
    }
  }, [user_id, setAttendanceData, setAttendanceLoading]);

  const fetchUserDetail = useCallback(async () => {
    if (!user_id) return;

    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance/daily`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            detail: true,
            user_id: user_id,
            date: date,
          }
        }
      );

      if (response.data.success) {
        const { userData, attendanceHistory } = response.data.data.data;

        if (userData) {
          setUserDetail(userData);
        }

        setAttendanceData(attendanceHistory || []);
      } else {
        setError('Failed to fetch user detail');
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
      setError('Failed to fetch user detail');
    } finally {
      setLoading(false);
    }
  }, [user_id, date, setUserDetail, setAttendanceData, setError, setLoading]);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    fetchAttendanceByMonth(month);
  };

  useEffect(() => {
    if (router.isReady && user_id) {
      fetchUserDetail();
    }
  }, [router.isReady, user_id, date, fetchUserDetail]);

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = pad(date.getUTCDate());
    const month = pad(date.getUTCMonth() + 1);
    const year = date.getUTCFullYear();
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getAttendanceStatus = (record: AttendanceRecord) => {
    if (record.is_late === 1) return 'danger';
    return 'success';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'danger': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </Main>
    );
  }

  if (error || !userData) {
    return (
      <Main>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'User not found'}</p>
            <button
              onClick={() => router.back()}
              className="btn btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </Main>
    );
  }

  const userDetail = userData?.user_detail?.[0];

  return (
    <Main>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
                  {userData.photo && userData.photo !== '-' ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${userData.photo || 'no-profile-2.png'}`}
                      alt={userData.name}
                      className="w-full h-full object-cover"
                      width={48}
                      height={48}
                      onError={(e) => {
                        e.currentTarget.src = '/no-profile-2.png';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <i className="ki-filled ki-user text-2xl text-blue-600"></i>
                    </div>
                  )}
                </div>
                <h2 className="font-bold text-lg text-gray-900 mb-2">{userData.name}</h2>
                <p className="text-sm text-gray-600 mb-3">{userData.division}</p>
                <span className="badge badge-outline badge-primary">
                  {userData.department}
                </span>
              </div>
            </div>

            {/* Details Toggle */}
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={toggleDrawer}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className="ki-filled ki-user"></i>
                  </div>
                  <span className="font-semibold text-gray-900">Employee Details</span>
                </div>
                {isDrawerOpen ? (
                  <i className="ki-filled ki-up"></i>
                ) : (
                  <i className="ki-filled ki-down"></i>
                )}
              </button>
            </div>

            {/* Collapsible Details */}
            <div className={`transition-all duration-300 ease-in-out overflow-auto ${isDrawerOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 space-y-3">
                {[
                  { label: "NRP", value: userData.personal_number },
                  { label: "Email", value: userData.email },
                  { label: "Address", value: userDetail?.address },
                  { label: "Birth Date", value: formatDate(userDetail?.birth_date) },
                  { label: "Plant", value: `${userDetail?.plant || '-'} - ${userData.company_name}` },
                  { label: "Status | Marital | Klasifikasi", value: `${userDetail?.status || '-'} | ${userDetail?.MsMarital?.code || '-'} | ${userDetail?.MsKlasifikasi?.name || '-'}` },
                  { label: "Join Date & End Date", value: `${formatDate(userDetail?.join_date)} s/d ${formatDate(userDetail?.end_date)}` },
                ].map((item, idx) => (
                  <div key={idx} className="py-2 border-b border-gray-200 last:border-b-0">
                    <div className="font-medium text-gray-800 text-sm mb-1">{item.label}</div>
                    <div className="text-sm text-gray-900 overflow-auto max-h-20">
                      {item.value || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div className="col-span-1 lg:col-span-2 bg-white shadow-lg rounded-2xl border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-3 font-bold text-xl text-gray-900">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ki-duotone ki-calendar text-3xl"></i>
                  </div>
                  User Attendances
                </h3>

                <button
                  onClick={() => router.back()}
                  className="btn btn-outline btn-primary"
                >
                  <i className="ki-filled ki-left"></i>
                  Back to List
                </button>
              </div>

              {/* Month Tabs */}
              <div className="flex space-x-3 overflow-x-auto pb-2 justify-between">
                {months.map((month) => (
                  <button
                    key={month.name}
                    onClick={() => handleMonthChange(month.value)}
                    disabled={attendanceLoading}
                    className={`flex-shrink-0 px-4 py-2 rounded-full transition-all duration-200 ${month.value === selectedMonth
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      } ${attendanceLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <p className="text-sm font-medium">{month.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Attendance List */}
            <div className="p-6 flex-1 min-h-0">
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="loading loading-spinner loading-md"></div>
                  <span className="ml-2">Loading attendance data...</span>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {attendanceData.length > 0 ? (
                    attendanceData.map((attendance) => {
                      const status = getAttendanceStatus(attendance);
                      return (
                        <div key={attendance.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {/* Status Badge */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
                                <span className={`badge badge-pill badge-outline ${getStatusColor(status)}`}>
                                  <i className="ki-filled ki-time mr-1"></i>
                                  In at {formatDateTime(attendance.in_time)}
                                </span>
                                <span className="hidden sm:inline">|</span>
                                <span className="badge badge-pill badge-outline bg-blue-100 text-blue-800 border-blue-200">
                                  <i className="ki-filled ki-time mr-1"></i>
                                  Out at {attendance.out_time ? formatDateTime(attendance.out_time) : '-'}
                                </span>
                              </div>

                              {/* Employee Name */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
                                <h4 className="font-bold text-gray-900">{attendance.MsUser.name}</h4>
                                <span className="hidden sm:inline">|</span>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  {userDetail?.MsVendor?.name || '-'}
                                </span>
                              </div>

                              {/* Location Info */}
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const imgUrl =
                                      attendance.foto_in && attendance.foto_in !== '-'
                                        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${attendance.foto_in}`
                                        : "/no-profile-2.png";

                                    return (
                                      <>
                                        <Image
                                          src={imgUrl}
                                          alt="Clock In"
                                          width={48}
                                          height={48}
                                          onClick={() => openLightbox(imgUrl)}
                                          className="w-10 h-10 rounded object-cover cursor-pointer"
                                        />
                                        <i className="ki-solid ki-geolocation text-danger"></i>
                                        <span>Location In: {attendance.latitude_in}, {attendance.longitude_in}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                                <div className="flex items-center gap-2">
                                  {(() => {
                                    const imgUrl =
                                      attendance.foto_out && attendance.foto_out !== '-'
                                        ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/${attendance.foto_out}`
                                        : "/no-profile-2.png";

                                    return (
                                      <>
                                        <Image
                                          src={imgUrl}
                                          alt="Clock Out"
                                          width={48}
                                          height={48}
                                          onClick={() => openLightbox(imgUrl)}
                                          className="w-10 h-10 rounded object-cover cursor-pointer"
                                        />
                                        <i className="ki-solid ki-geolocation text-primary"></i>
                                        <span>Location Out: {attendance.latitude_out}, {attendance.longitude_out}</span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>

                            {/* Shift Information - Right Side */}
                            <div className="ml-6 text-center">
                              <div className="bg-gray-50 p-3 rounded-lg border border-gray-300 min-w-[120px]">
                                <h5 className="font-semibold text-gray-800 mb-2 text-sm">
                                  {attendance.MsShift?.name || 'No Shift'}
                                </h5>
                                <div className="text-xs text-gray-600 space-y-1">
                                  <div className="flex items-center justify-center gap-1">
                                    <i className="ki-solid ki-time"></i>
                                    <span>In Time: {attendance.MsShift?.in_time ? formatTime(attendance.MsShift.in_time) : '--:--'}</span>
                                    <i className="ki-solid ki-time"></i>
                                    <span>Out Time: {attendance.MsShift?.out_time ? formatTime(attendance.MsShift.out_time) : '--:--'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <i className="ki-duotone ki-file-deleted text-6xl text-gray-300 mb-4"></i>
                      <p className="text-gray-500">No attendance records found for {months[selectedMonth].name}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FsLightbox toggler={lightboxToggler} sources={[lightboxSrc]} />
    </Main>
  );
}