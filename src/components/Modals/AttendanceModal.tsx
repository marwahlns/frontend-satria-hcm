import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

type AbsenFormProps = {
  onClose: () => void;
};

export default function AbsenForm({ onClose }: AbsenFormProps) {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0"); // bulan dari 0
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      // Format waktu lokal tanpa Z
      const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      setTime(formattedTime);
    }, 1000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.error("Gagal ambil lokasi", err)
      );
    }

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          videoStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Gagal akses kamera", err));
    }

    return () => {
      clearInterval(interval);
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const MAX_WIDTH = 400; // atau sesuai kebutuhan
  const MAX_HEIGHT = 300;

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");

      // Resize
      canvas.width = MAX_WIDTH;
      canvas.height = MAX_HEIGHT;

      context?.drawImage(video, 0, 0, MAX_WIDTH, MAX_HEIGHT);
      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      setPhoto(imageData);
    }
  };

  const getPhotoFileName = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `absensi_${yyyy}-${mm}-${dd}.jpg`;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!location || !photo || !time) {
        console.error("Lokasi atau foto atau waktu belum tersedia.");
        return;
      }

      const token = Cookies.get("token");

      // Ambil tanggal hari ini
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];

      // Format waktu menjadi HH:mm:ss

      let fileToUpload;
      if (typeof photo === "string" && photo.startsWith("data:image")) {
        // Ubah base64 menjadi file
        const base64 = photo.split(",")[1]; // Hanya ambil bagian base64
        const mimeType = photo.split(";")[0].split(":")[1]; // Ambil mime type
        const byteCharacters = atob(base64); // Decode base64
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        fileToUpload = new File([byteArray], getPhotoFileName(), {
          type: mimeType,
        });
      } else {
        // Jika photo sudah berupa file, langsung pakai
        fileToUpload = photo;
      }

      // Membuat FormData untuk mengirimkan foto sebagai file dan data lainnya
      const formData = new FormData();
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lon.toString());
      formData.append("time", time);
      formData.append("foto", fileToUpload); // Menambahkan foto dalam bentuk file

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/trx/attendance`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data", // Memastikan request menjadi multipart
          },
        }
      );

      if (response.data.success) {
        console.log("Absen berhasil:", response.data.message);
      } else {
        console.error("Gagal absen:", response.data.message);
      }
    } catch (error: any) {
      console.error(
        "Error saat mengirim absen:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <p className="mb-2">
          Waktu: <span className="font-semibold">{time}</span>
        </p>
        <p className="mb-2">
          Lokasi:{" "}
          {location ? (
            <span className="font-semibold">
              {location.lat.toFixed(5)}, {location.lon.toFixed(5)}
            </span>
          ) : (
            "Mengambil lokasi..."
          )}
        </p>

        <div className="my-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-md"
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 mt-2 rounded-lg w-full"
            onClick={capturePhoto}
          >
            Ambil Foto
          </button>

          {photo && (
            <img
              src={photo}
              alt="Snapshot"
              className="w-full rounded-md border mt-2"
            />
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            onClick={handleSubmit}
            disabled={loading || !photo}
          >
            {loading ? "Mengirim..." : "Kirim Absen"}
          </button>
        </div>
      </div>
    </div>
  );
}
