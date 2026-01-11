
import React, { useEffect, useRef, useState } from 'react';
import { UserProfile, LocationHistory } from '../types';

interface TrackingMapProps {
  drivers: UserProfile[];
  history?: LocationHistory[];
  selectedDriverId?: string | null;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ drivers, history = [], selectedDriverId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const polylineRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) {
      setMapError("Map library (Leaflet) not loaded. Please refresh.");
      return;
    }

    try {
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: true,
          attributionControl: false
        }).setView([28.6139, 77.2090], 12);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(mapRef.current);

        L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
        
        // Handle map container size issues in modals
        setTimeout(() => {
          if (mapRef.current) mapRef.current.invalidateSize();
        }, 100);
      }
    } catch (err) {
      console.error("Map Init Error:", err);
      setMapError("Failed to initialize map container.");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        polylineRef.current = null;
      }
    };
  }, []);

  // Update Markers and Paths
  useEffect(() => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    try {
      // 1. Update/Add Driver Markers
      drivers.forEach(driver => {
        const lat = Number(driver.currentLat);
        const lng = Number(driver.currentLng);
        if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

        const pos: [number, number] = [lat, lng];
        
        if (markersRef.current[driver.$id]) {
          markersRef.current[driver.$id].setLatLng(pos);
        } else {
          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute w-12 h-12 bg-blue-500 rounded-full border-2 border-white shadow-xl animate-ping opacity-20"></div>
                <div class="relative w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10 flex items-center justify-center">
                   <div class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          markersRef.current[driver.$id] = L.marker(pos, { icon: customIcon })
            .addTo(mapRef.current);
        }
      });

      // 2. Update History Polyline
      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      if (selectedDriverId && history.length > 0) {
        const pathCoords = history
          .filter(h => h.driverId === selectedDriverId)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .map(h => [Number(h.lat), Number(h.lng)] as [number, number])
          .filter(coords => !isNaN(coords[0]) && !isNaN(coords[1]));

        if (pathCoords.length > 0) {
          polylineRef.current = L.polyline(pathCoords, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10',
            lineJoin: 'round'
          }).addTo(mapRef.current);

          // Fit bounds to show the entire path
          const bounds = L.latLngBounds(pathCoords);
          mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
        }
      } else if (!selectedDriverId && drivers.length > 0) {
        // Reset view for global fleet
        const allPos = drivers.map(d => [Number(d.currentLat), Number(d.currentLng)] as [number, number]).filter(p => !isNaN(p[0]));
        if (allPos.length > 0) {
          const bounds = L.latLngBounds(allPos);
          mapRef.current.fitBounds(bounds, { padding: [100, 100], animate: true });
        }
      }
    } catch (err) {
      console.warn("Map Update Error:", err);
    }
  }, [drivers, history, selectedDriverId]);

  if (mapError) return <div className="p-10 text-red-500">{mapError}</div>;

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 z-[1000] glass-panel !bg-black/40 !rounded-2xl px-6 py-3 border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Live Telemetry Link</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;
