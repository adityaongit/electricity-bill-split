import { ImageResponse } from "next/og"
import { config } from "@/lib/config"

export const ogImageSize = {
  width: 1200,
  height: 630,
} as const

export const ogImageContentType = "image/png"

interface OgStat {
  label: string
  value: string
}

interface OgImageOptions {
  eyebrow: string
  title: string
  description: string
  pathLabel: string
  stats: OgStat[]
}

function OgCard({ eyebrow, title, description, pathLabel, stats }: OgImageOptions) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #f7f1e6 0%, #fffaf1 52%, #efe3cf 100%)",
        color: "#2d231f",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(173, 65, 25, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(173, 65, 25, 0.07) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0.15))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -40,
          width: 380,
          height: 380,
          borderRadius: 9999,
          background: "rgba(173, 65, 25, 0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -80,
          width: 460,
          height: 460,
          borderRadius: 9999,
          background: "rgba(67, 48, 32, 0.07)",
        }}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          padding: "48px",
          gap: "28px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            border: "1px solid rgba(67, 48, 32, 0.14)",
            borderRadius: "28px",
            padding: "34px",
            background: "rgba(255, 252, 247, 0.86)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#ad4119",
                  color: "#fff9f1",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                S
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: "16px", color: "#7a6053", textTransform: "uppercase", letterSpacing: "0.18em" }}>
                  {eyebrow}
                </div>
                <div style={{ fontSize: "24px", fontWeight: 700 }}>{config.app.name}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  fontSize: "64px",
                  lineHeight: 1.03,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: "26px",
                  lineHeight: 1.35,
                  color: "#5c4a41",
                  maxWidth: "680px",
                }}
              >
                {description}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "18px",
                color: "#6e594d",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: 9999,
                  background: "#d98e4d",
                }}
              />
              Fair roommate utility splits
            </div>
            <div
              style={{
                display: "flex",
                borderRadius: "999px",
                border: "1px solid rgba(67, 48, 32, 0.12)",
                padding: "10px 16px",
                fontSize: "18px",
                color: "#7a6053",
                background: "rgba(255,255,255,0.65)",
              }}
            >
              {pathLabel}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "308px",
            gap: "16px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={`${stat.label}-${stat.value}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1,
                borderRadius: "24px",
                padding: "24px",
                border: "1px solid rgba(67, 48, 32, 0.12)",
                background: "rgba(255, 250, 241, 0.88)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: "42px",
                  height: "42px",
                  borderRadius: "14px",
                  background: "rgba(173, 65, 25, 0.12)",
                  border: "1px solid rgba(173, 65, 25, 0.16)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "18px", color: "#7a6053", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: "34px", lineHeight: 1.1, fontWeight: 800 }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function createOgImage(options: OgImageOptions) {
  return new ImageResponse(<OgCard {...options} />, ogImageSize)
}
