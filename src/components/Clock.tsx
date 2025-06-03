import React, { useEffect, useState } from "react";

const padTime = (num: number) => String(num).padStart(2, "0");

interface StopwatchProps {
  isStart?: boolean;
  clockInTime?: string; // format "HH:mm" atau timestamp
  clockOutTime?: string; // format "HH:mm" atau timestamp
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  showControls?: boolean;
}

const Stopwatch: React.FC<StopwatchProps> = ({
  isStart: externalIsStart,
  clockInTime,
  clockOutTime,
  onStart,
  onStop,
  onReset,
  showControls = true
}) => {
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [internalIsStart, setInternalIsStart] = useState<boolean>(false);
  const [isClient, setIsClient] = useState(false);

  // Gunakan external control jika ada, fallback ke internal
  const isRunning = externalIsStart !== undefined ? externalIsStart : internalIsStart;

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Hitung initial elapsed time berdasarkan clockInTime dan clockOutTime
  useEffect(() => {
    if (clockInTime && clockInTime !== "00:00" && clockInTime !== "-") {
      const parseDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return isNaN(date.getTime()) ? null : date;
      };

      const clockInDate = new Date(clockInTime);
      if (!clockInDate) return;

      let elapsedSeconds = 0;

      if (clockOutTime && clockOutTime !== "-" && clockOutTime !== "00:00") {
        // Sudah absen pulang - hitung selisih clockOut - clockIn
        const clockOutDate = parseDateTime(clockOutTime);
        if (clockOutDate) {
          const elapsedMs = clockOutDate.getTime() - clockInDate.getTime();
          elapsedSeconds = Math.floor(elapsedMs / 1000);

          // Set fixed time (tidak berjalan lagi)
          setAccumulatedTime(elapsedSeconds);
          setCurrentTime(elapsedSeconds);
          setStartTimestamp(null); // Stop counting
        }
      } else if (isRunning) {        
        // Belum absen pulang - hitung dari clockIn sampai sekarang
        const now = new Date();
        const elapsedMs = now.getTime() - clockInDate.getTime();
        elapsedSeconds = Math.floor(elapsedMs / 1000);

        if (elapsedSeconds > 0) {
          setAccumulatedTime(elapsedSeconds);
          setCurrentTime(elapsedSeconds);
          setStartTimestamp(now.getTime()); // Continue counting
        }
      }
    } else if (clockInTime === "-" || !clockInTime) {
      setAccumulatedTime(0);
      setCurrentTime(0);
      setStartTimestamp(null);
    }
  }, [clockInTime, clockOutTime, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Hanya berjalan jika belum clock out dan sedang running
    if (isRunning && startTimestamp && (!clockOutTime || clockOutTime === "-")) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
        setCurrentTime(accumulatedTime + elapsedSeconds);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTimestamp, accumulatedTime, clockOutTime]);

  // Handle external start/stop changes
  useEffect(() => {
    if (externalIsStart !== undefined) {
      if (externalIsStart && !startTimestamp && accumulatedTime === 0) {
        // External start ONLY if not running and belum dihitung dari clockIn
        const now = Date.now();
        setStartTimestamp(now);
      } else if (!externalIsStart && startTimestamp) {
        // External stop
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
        setAccumulatedTime(prev => prev + elapsedSeconds);
        setCurrentTime(accumulatedTime + elapsedSeconds);
        setStartTimestamp(null);
      }
    }
  }, [externalIsStart, startTimestamp, accumulatedTime]);

  if (!isClient) return null;

  const hours = Math.floor(currentTime / 3600);
  const minutes = Math.floor((currentTime % 3600) / 60);
  const seconds = currentTime % 60;

  const handleStart = () => {
    const now = Date.now();
    setStartTimestamp(now);
    setInternalIsStart(true);
    onStart?.();
  };

  const handleStop = () => {
    if (startTimestamp) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTimestamp) / 1000);
      setAccumulatedTime(prev => prev + elapsedSeconds);
      setCurrentTime(accumulatedTime + elapsedSeconds);
    }
    setInternalIsStart(false);
    setStartTimestamp(null);
    onStop?.();
  };

  const handleReset = () => {
    setAccumulatedTime(0);
    setCurrentTime(0);
    setInternalIsStart(false);
    setStartTimestamp(null);
    onReset?.();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 mt-4">
      {/* Display */}
      <div className="flex items-center justify-center space-x-4">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="bg-[#E5ECFF] rounded-lg px-4 py-2 text-xl font-semibold text-gray-800">
            {padTime(hours)}
          </div>
          <span className="text-sm text-gray-800 mt-1">Hours</span>
        </div>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="bg-[#E5ECFF] rounded-lg px-4 py-2 text-xl font-semibold text-gray-800">
            {padTime(minutes)}
          </div>
          <span className="text-sm text-gray-800 mt-1">Minutes</span>
        </div>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="bg-[#E5ECFF] rounded-lg px-4 py-2 text-xl font-semibold text-gray-800">
            {padTime(seconds)}
          </div>
          <span className="text-sm text-gray-800 mt-1">Seconds</span>
        </div>
      </div>

      {/* Controls - hanya tampil jika showControls true */}
      {showControls && (
        <div className="flex space-x-3">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Start
          </button>

          <button
            onClick={handleStop}
            disabled={!isRunning}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Stop
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;