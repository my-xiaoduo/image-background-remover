/// <reference types="@cloudflare/workers-types" />

interface Env {
  REMOVE_BG_API_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await context.request.formData();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const image = formData.get("image");
  if (!image || !(image instanceof File)) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  if (image.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append("image_file", image);
  upstream.append("size", "auto");

  let res: Response;
  try {
    res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: upstream,
    });
  } catch {
    return Response.json({ error: "Failed to reach remove.bg API" }, { status: 502 });
  }

  if (!res.ok) {
    if (res.status === 402) {
      return Response.json({ error: "Free quota exceeded. Please try again later." }, { status: 402 });
    }
    if (res.status === 400) {
      return Response.json({ error: "Could not process image. Please try a different photo." }, { status: 400 });
    }
    return Response.json({ error: `Background removal failed (${res.status})` }, { status: res.status });
  }

  const resultBuffer = await res.arrayBuffer();
  return new Response(resultBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
};
