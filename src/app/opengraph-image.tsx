import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700 }}>Viksit Chetna</div>
        <div style={{ fontSize: 32, marginTop: 16, opacity: 0.9 }}>
          Intellectual Club
        </div>
        <div style={{ fontSize: 24, marginTop: 12, opacity: 0.7 }}>
          Where Minds Meet &amp; Ideas Ignite
        </div>
      </div>
    ),
    { ...size }
  );
}
