import { useMemo } from "react";

export default function IphonePreviewPage() {
  const iframeSrc = useMemo(() => {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("demoDevice", "iphone-17-pro");
    return `${url.pathname}${url.search}${url.hash}`;
  }, []);

  return (
    <main className="h-dvh overflow-hidden bg-[#f4f2ee] px-[28px] py-[28px]">
      <section className="mx-auto flex h-full w-full items-center justify-center">
        <div className="iphone-preview-shell" aria-label="iPhone 17 Pro preview">
          <div className="iphone-preview-side-button iphone-preview-side-button-left" />
          <div className="iphone-preview-side-button iphone-preview-side-button-right" />
          <div className="iphone-preview-bezel">
            <div className="iphone-preview-island" />
            <iframe
              title="iPhone 17 Pro mobile preview"
              src={iframeSrc}
              className="iphone-preview-screen no-scrollbar"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
