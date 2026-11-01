import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#4352d6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 74, height: 74, borderRadius: 74, background: "#d9c8f5", marginRight: -22 }} />
        <div style={{ width: 74, height: 74, borderRadius: 74, background: "#e4f08e", opacity: 0.92 }} />
      </div>
    ),
    size,
  );
}
