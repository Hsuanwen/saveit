import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const size = parseInt(searchParams.get("size") || "192");

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: size * 0.22,
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: size * 0.45,
            fontWeight: 800,
            fontFamily: "sans-serif",
            letterSpacing: "-2px",
          }}
        >
          S
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
