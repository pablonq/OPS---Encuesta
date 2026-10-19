"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ value, size = 220, fileName = "qr-encuesta.png" }) {
  const canvasRef = useRef(null);
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    setError("");
    QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1 }, (err) => {
      if (err) setError("No se pudo generar el código QR");
    });
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then(setDataUrl)
      .catch(() => setError("No se pudo generar el código QR"));
  }, [value, size]);

  if (!value) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-ops-lg border border-ops-border bg-white p-3 shadow-ops-sm">
        <canvas ref={canvasRef} />
      </div>
      {error && <p className="text-sm text-ops-danger">{error}</p>}
      {dataUrl && !error && (
        <a
          href={dataUrl}
          download={fileName}
          className="inline-flex items-center gap-2 rounded-ops-md bg-ops-blue px-4 py-2 text-sm font-medium text-white hover:bg-ops-blue-600 hover:shadow-ops-blue"
        >
          Descargar QR
        </a>
      )}
    </div>
  );
}
