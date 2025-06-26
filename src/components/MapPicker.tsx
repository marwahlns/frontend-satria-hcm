import { useEffect, useRef, useState } from 'react';
import Swal from "sweetalert2";

// Declare Leaflet type untuk TypeScript
declare global {
    interface Window {
        L: any;
    }
}

const MapPicker = ({ onLocationSelect, selectedPosition, height = '400px' }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        // Load Leaflet secara dinamis untuk menghindari SSR issues
        const loadLeaflet = async () => {
            if (typeof window !== 'undefined' && !window.L) {
                // Load Leaflet CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);

                // Load Leaflet JS
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = () => {
                    // Fix untuk icon Leaflet di Next.js
                    delete window.L.Icon.Default.prototype._getIconUrl;
                    window.L.Icon.Default.mergeOptions({
                        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    });
                    initializeMap();
                };
                document.head.appendChild(script);
            } else if (window.L) {
                initializeMap();
            }
        };

        const initializeMap = () => {
            if (mapRef.current && !mapInstanceRef.current) {
                // Default ke Jakarta jika tidak ada posisi yang dipilih
                const defaultPosition = selectedPosition || { lat: -6.2088, lng: 106.8456 };

                const map = window.L.map(mapRef.current).setView([defaultPosition.lat, defaultPosition.lng], 13);

                // Tambahkan tile layer
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Event handler untuk klik pada map
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng;

                    // Hapus marker lama jika ada
                    if (markerRef.current) {
                        map.removeLayer(markerRef.current);
                    }

                    // Tambah marker baru
                    markerRef.current = window.L.marker([lat, lng]).addTo(map);

                    // Callback ke parent component
                    onLocationSelect({ lat, lng });
                });

                mapInstanceRef.current = map;
                setIsMapReady(true);
            }
        };

        loadLeaflet();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markerRef.current = null;
            }
        };
    }, []);

    // Update marker ketika selectedPosition berubah dari luar
    useEffect(() => {
        if (isMapReady && mapInstanceRef.current && selectedPosition) {
            // Hapus marker lama
            if (markerRef.current) {
                mapInstanceRef.current.removeLayer(markerRef.current);
            }

            // Tambah marker baru
            markerRef.current = window.L.marker([selectedPosition.lat, selectedPosition.lng])
                .addTo(mapInstanceRef.current);

            // Pan ke posisi baru
            mapInstanceRef.current.setView([selectedPosition.lat, selectedPosition.lng], 13);
        }
    }, [selectedPosition, isMapReady]);

    // Get current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newPosition = { lat: latitude, lng: longitude };

                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([latitude, longitude], 15);

                        // Hapus marker lama
                        if (markerRef.current) {
                            mapInstanceRef.current.removeLayer(markerRef.current);
                        }

                        // Tambah marker baru
                        markerRef.current = window.L.marker([latitude, longitude])
                            .addTo(mapInstanceRef.current);
                    }

                    onLocationSelect(newPosition);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    Swal.fire({
                        title: "Can't Access Location",
                        text: "Unable to get your current location. Please click on the map to select a location.",
                        icon: "info",
                    });
                }
            );
        } else {
            Swal.fire({
                title: "Browser Not Supported",
                text: "Geolocation is not supported by this browser.",
                icon: "error",
            });
        }
    };

    return (
        <div className="relative">
            <div
                ref={mapRef}
                style={{ height: height, width: '100%' }}
                className="rounded border border-gray-300"
            />

            {/* Control buttons */}
            <div className="absolute top-2 right-2 z-[1000] flex flex-col gap-1">
                <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="bg-white border border-gray-300 rounded px-2 py-1 text-xs shadow hover:bg-gray-50"
                    title="Get current location"
                >
                    📍 My Location
                </button>
            </div>

            {/* Instructions */}
            <div className="text-xs text-gray-500 mt-2">
                💡 Click anywhere on the map to select a location, or use "My Location" to get your current position.
            </div>
        </div>
    );
};

export default MapPicker;