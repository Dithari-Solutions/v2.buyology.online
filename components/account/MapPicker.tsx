"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";

/**
 * Pick a delivery point on an OpenStreetMap map.
 *
 * Typing an address is the part of checkout people abandon, and in the UAE a written address
 * often cannot locate a building at all — which is also what the courier needs, since Quiqup
 * route on coordinates. Dropping a pin gives an exact point and lets the written lines be
 * filled in from it.
 *
 * Leaflet is loaded dynamically inside the effect rather than imported at module scope: it
 * touches `window` on import and would break the server render. The map is created once and
 * then only ever told to move, so panning never fights a re-render.
 */
export function MapPicker({
  value,
  onChange,
  label,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }) => void;
  label: string;
}) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  // Leaflet's own types are not available until the dynamic import resolves.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  // The map is built once; the callback it closes over must stay current without rebuilding it.
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Dubai's centre — a sensible first view before a pin exists.
  const fallback = { lat: 25.2048, lng: 55.2708 };

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const start = value ?? fallback;
      const map = L.map(containerRef.current, {
        center: [start.lat, start.lng],
        zoom: value ? 16 : 11,
        // A map inside a scrolling form must not swallow the page scroll; a deliberate
        // click enables the wheel, which is Leaflet's own answer to this.
        scrollWheelZoom: false,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        // Required by the OpenStreetMap tile usage policy.
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html:
          '<span style="display:block;width:22px;height:22px;border-radius:9999px;' +
          'background:#ffbe12;border:3px solid #402f75;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const marker = L.marker([start.lat, start.lng], { draggable: true, icon }).addTo(map);

      const emit = (lat: number, lng: number) => onChangeRef.current({ lat, lng });
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        emit(p.lat, p.lng);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        emit(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);
      // The container is often laid out after the map is created (inside a form that was just
      // opened), which leaves Leaflet believing it is 0px tall and rendering one grey tile.
      setTimeout(() => map.invalidateSize(), 0);

      cleanup = () => {
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // Built once on mount; `value` is applied by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow coordinates set elsewhere — "use my location", or an address being edited.
  useEffect(() => {
    if (!ready || !value || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([value.lat, value.lng]);
    mapRef.current.setView([value.lat, value.lng], Math.max(mapRef.current.getZoom(), 16));
  }, [ready, value]);

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-foreground">{label}</p>
      <div
        ref={containerRef}
        role="application"
        aria-label={label}
        className="h-56 w-full overflow-hidden rounded-xl border border-border bg-surface-2 sm:h-64"
      />
      <p className="mt-1.5 text-xs text-muted">{t.account.addresses.mapHint}</p>
    </div>
  );
}
