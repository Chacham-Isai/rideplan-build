import { ReactNode, useRef, useEffect, useState } from "react";

interface SlideLayoutProps {
  children: ReactNode;
  className?: string;
}

const SLIDE_W = 1920;
const SLIDE_H = 1080;

export const ScaledSlide = ({ children, className = "" }: SlideLayoutProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const scaleX = parent.clientWidth / SLIDE_W;
      const scaleY = parent.clientHeight / SLIDE_H;
      setScale(Math.min(scaleX, scaleY));
    };
    resize();
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    if (containerRef.current?.parentElement) observer.observe(containerRef.current.parentElement);
    return () => { window.removeEventListener("resize", resize); observer.disconnect(); };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute slide-content ${className}`}
      style={{
        width: SLIDE_W,
        height: SLIDE_H,
        left: "50%",
        top: "50%",
        marginLeft: -SLIDE_W / 2,
        marginTop: -SLIDE_H / 2,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

export const SlideContainer = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ width: "100%", height: "100%" }}>
    {children}
  </div>
);
