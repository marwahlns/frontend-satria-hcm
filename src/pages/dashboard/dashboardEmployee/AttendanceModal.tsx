import Modal from "@/components/Modal";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import Swal from "sweetalert2";

type Props = {
    isModalOpen: boolean;
    onClose: () => void;
    setRefetch: (b: boolean) => void;
    isRefetch: boolean;
    shiftId: string;
    startIn: string;
    inTime: string;
    endIn: string;
    startOut: string;
    endOut: string;
    type: "checkin" | "checkout";
};

const AttendanceModal = ({
    isModalOpen,
    onClose,
    setRefetch,
    isRefetch,
    shiftId,
    inTime,
    startIn,
    endIn,
    startOut,
    endOut,
    type,
}: Props) => {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
        null
    );
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!isModalOpen) return;

        /* realtime location */
        navigator.geolocation.getCurrentPosition(
            (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => console.error("Gagal ambil lokasi", err),
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 0 }
        );

        /* camera */
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
                videoStreamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;
            })
            .catch((err) => console.error("Gagal akses kamera", err));

        return () => {
            videoStreamRef.current?.getTracks().forEach((t) => t.stop());
        };
    }, [isModalOpen]);

    const getUserIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org/?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get IP:', error);
            return null;
        }
    };

    /* ---------- Helpers ---------- */
    const captureBase64 = (): string | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;

        const MAX_W = 400,
            MAX_H = 300;
        canvas.width = MAX_W;
        canvas.height = MAX_H;
        canvas.getContext("2d")?.drawImage(video, 0, 0, MAX_W, MAX_H);
        return canvas.toDataURL("image/jpeg", 0.7);
    };

    const base64ToFile = (b64: string): File => {
        const [head, data] = b64.split(",");
        const mime = head.match(/:(.*?);/)?.[1] || "image/jpeg";
        const bin = atob(data);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        const name = `absensi_${new Date().toISOString().split("T")[0]}.jpg`;
        return new File([arr], name, { type: mime });
    };

    const handleSubmit = async () => {
        if (!location) return;

        const userIP = await getUserIP();
        
        const b64 = captureBase64();
        if (!b64) {
            console.error("Gagal mengambil foto");
            return;
        }

        const fotoFile = base64ToFile(b64);
        const form = new FormData();
        form.append("userIP", userIP || "");
        form.append("latitude", String(location.lat));
        form.append("longitude", String(location.lon));
        form.append("shiftId", shiftId);
        form.append("inTime", inTime);
        form.append("foto", fotoFile);

        let endpoint = "";
        if (type === "checkin") {
            endpoint = "/api/trx/attendance/check-in";
            form.append("startIn", startIn);
            form.append("endIn", endIn);
        } else {
            endpoint = "/api/trx/attendance/check-out";
            form.append("endIn", endIn);
            form.append("startOut", startOut);
            form.append("endOut", endOut);
        }

        try {
            setLoading(true);

            const token = Cookies.get("token");
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
                form,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                setRefetch(!isRefetch);
                onClose();
                Swal.fire({
                    title: "Success",
                    text: `Successfully ${type === "checkin" ? "checked in" : "checked out"}`,
                    icon: "success",
                });
            } else {
                throw new Error(data.message || "Server responded with error");
            }
        } catch (err: any) {
            onClose();
            const message =
                err?.response?.data?.message || err.message || "Something went wrong";
            Swal.fire({
                title: "Error",
                text: message,
                icon: "error",
            });
            console.error("Attendance error:", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isModalOpen={isModalOpen}>
            <div className="modal-header">
                <h3 className="modal-title">
                    {type === "checkin" ? "Start Attendance" : "Finish Attendance"}
                </h3>
                <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
                    <i className="ki-outline ki-cross" />
                </button>
            </div>

            <div className="modal-body">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-md" />
                <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="modal-footer flex justify-end gap-2">
                <button className="btn btn-light" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || !location}>
                    {loading ? (
                        <>
                            <svg
                                className="animate-spin h-5 w-5 mr-3 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Loading...
                        </>
                    ) : (
                        "Submit"
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default AttendanceModal;
