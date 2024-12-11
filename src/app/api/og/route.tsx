import { ImageResponse } from "next/og";
// App router includes @vercel/og.
// No need to install it.

async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error(`Failed to load ${font} font`);
}

export async function GET() {
  const text = "Ask anything about Eliza"; // Text that will be displayed
  const fontNormal = await loadGoogleFont("Inter", text);
  const fontBold = await loadGoogleFont("Inter:wght@600", text);

  return new ImageResponse(
    (
      <div
        style={{
          fontFamily: "Inter",
        }}
        tw="flex flex-col items-center justify-center w-full h-full bg-black text-white"
      >
        <div tw="flex flex-col items-center justify-center w-full p-8">
          {/* Title */}
          <h1
            style={{
              fontFamily: "Inter",
              fontWeight: "900",
            }}
            tw="text-4xl font-semibold text-center tracking-tighter mb-8"
          >
            {text}
          </h1>

          {/* Textarea visualization */}
          <div tw="flex w-full max-w-xl mx-auto">
            <div tw="flex flex-col w-full rounded-lg border border-white/5 bg-white/5">
              <div tw="flex flex-col">
                <div tw="flex w-full min-h-[36px]">
                  <div
                    style={{
                      fontFamily: "Inter",
                    }}
                    tw="w-full bg-transparent px-4 py-3 text-base text-zinc-500"
                  >
                    Ask anything...
                  </div>
                </div>
                <div tw="flex w-full items-center justify-between px-2 pb-2.5">
                  <div />
                  <div tw="flex items-center justify-center w-8 h-8 rounded-md bg-[#ff8c00]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontNormal,
          style: "normal",
          weight: 400,
        },
        {
          name: "Inter",
          data: fontBold,
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
