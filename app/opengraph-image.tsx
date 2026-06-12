import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse — Nigerian Tech Compensation Index";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// EKG heartbeat path, scaled for the OG canvas.
const EKG_PATH =
  "M0,40 L160,40 L200,40 L240,8 L280,72 L310,18 L340,62 L370,30 L400,40 " +
  "L520,40 L560,40 L600,8 L640,72 L670,18 L700,62 L730,30 L760,40 " +
  "L880,40 L920,40 L960,8 L1000,72 L1030,18 L1060,62 L1090,30 L1120,40 L1200,40";

export default function OGImage() {
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
          backgroundColor: "#0B1120",
          backgroundImage: "radial-gradient(ellipse at center, rgba(200,150,42,0.08) 0%, rgba(11,17,32,0) 70%)",
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#F0EBE1",
            display: "flex",
          }}
        >
          PULSE
        </div>
        <svg width="900" height="80" viewBox="0 0 1200 80">
          <path
            d={EKG_PATH}
            stroke="#C8962A"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            fontSize: 36,
            color: "rgba(240,235,225,0.85)",
            marginTop: 24,
            display: "flex",
          }}
        >
          Nigerian Tech Compensation Index
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#C8962A",
            marginTop: 16,
            display: "flex",
          }}
        >
          Anonymous. Free. Built for your next negotiation.
        </div>
      </div>
    ),
    size
  );
}
