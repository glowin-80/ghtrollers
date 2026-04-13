import { NextResponse } from "next/server";
import { fetchPublicApprovedCatchById } from "@/lib/public-catch";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isSafeHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const catchItem = await fetchPublicApprovedCatchById(id);

  if (!catchItem?.image_url) {
    return new NextResponse("Catch image not found.", { status: 404 });
  }

  if (!isSafeHttpUrl(catchItem.image_url)) {
    return new NextResponse("Invalid image URL.", { status: 400 });
  }

  const upstreamResponse = await fetch(catchItem.image_url, {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    return new NextResponse("Unable to fetch upstream catch image.", {
      status: 502,
    });
  }

  const contentType =
    upstreamResponse.headers.get("content-type") || "image/jpeg";

  const arrayBuffer = await upstreamResponse.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Disposition": 'inline; filename="catch-share-image"',
    },
  });
}