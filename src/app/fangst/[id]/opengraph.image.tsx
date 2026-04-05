import { ImageResponse } from "next/og";
import {
  formatCatchDateForDisplay,
  formatCatchWeightForDisplay,
  getCatchFishLabel,
} from "@/lib/catch-sharing";
import { fetchPublicApprovedCatchById } from "@/lib/public-catch";

export const runtime = "nodejs";
export const revalidate = 300;
export const contentType = "image/png";

export const size = {
  width: 1200,
  height: 630,
};

type OpenGraphImageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getInitials(fullName: string) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "GT";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

async function getImageDataUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return null;
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return null;
    }

    const contentTypeHeader = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return `data:${contentTypeHeader};base64,${base64}`;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id } = await params;
  const catchItem = await fetchPublicApprovedCatchById(id);

  if (!catchItem) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #163b27 0%, #315b3d 100%)",
            color: "#fcfbf8",
            fontSize: 54,
            fontWeight: 800,
          }}
        >
          Gäddhäng Trollers
        </div>
      ),
      size
    );
  }

  const imageDataUrl = await getImageDataUrl(catchItem.image_url);
  const fishLabel = getCatchFishLabel(catchItem);
  const weightLabel = formatCatchWeightForDisplay(catchItem.weight_g);
  const dateLabel = formatCatchDateForDisplay(catchItem.catch_date);
  const initials = getInitials(catchItem.caught_for);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#10281d",
          color: "#fcfbf8",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(9,21,16,0.86) 0%, rgba(9,21,16,0.48) 42%, rgba(9,21,16,0.14) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.10) 45%, rgba(8,17,13,0.78) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "44px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 22px",
                  borderRadius: 999,
                  background: "rgba(10, 31, 20, 0.62)",
                  border: "2px solid rgba(219, 196, 123, 0.62)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 54,
                    height: 54,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.16)",
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  {initials}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 17, letterSpacing: 3, textTransform: "uppercase", opacity: 0.82 }}>
                    Offentlig fångst
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>Gäddhäng Trollers</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 999,
                  background: "rgba(252, 251, 248, 0.92)",
                  color: "#183225",
                  fontSize: 22,
                  fontWeight: 800,
                }}
              >
                {weightLabel}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: 760,
                gap: 16,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "rgba(252, 251, 248, 0.92)",
                  }}
                >
                  {fishLabel}
                </div>
                <div
                  style={{
                    fontSize: 62,
                    lineHeight: 1.02,
                    fontWeight: 800,
                    textWrap: "balance",
                  }}
                >
                  {catchItem.caught_for}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: 999,
                    background: "rgba(252, 251, 248, 0.16)",
                    border: "1px solid rgba(252, 251, 248, 0.24)",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  Datum · {dateLabel}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "12px 18px",
                    borderRadius: 999,
                    background: "rgba(252, 251, 248, 0.16)",
                    border: "1px solid rgba(252, 251, 248, 0.24)",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  Webbapp för fisketävlingen
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}