/** On-screen touch controls: left joystick to move, drag right half to look, buttons for jump/sprint/crouch. */
import { useEffect, useRef, useState } from "react";
import { input } from "./input";

const STICK = 56; // px radius of joystick travel

export function MobileControls() {
  const [stick, setStick] = useState({ x: 0, y: 0, active: false });
  const joy = useRef<{ id: number; cx: number; cy: number } | null>(null);
  const look = useRef<{ id: number; x: number; y: number } | null>(null);
  const [sprint, setSprint] = useState(false);
  const [crouch, setCrouch] = useState(false);

  useEffect(() => {
    input.sprint = sprint;
  }, [sprint]);
  useEffect(() => {
    input.crouch = crouch;
  }, [crouch]);

  const onTouchStart = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (t.clientX < window.innerWidth * 0.45 && !joy.current) {
        joy.current = { id: t.identifier, cx: t.clientX, cy: t.clientY };
        setStick({ x: 0, y: 0, active: true });
      } else if (!look.current) {
        look.current = { id: t.identifier, x: t.clientX, y: t.clientY };
      }
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (joy.current && t.identifier === joy.current.id) {
        let dx = t.clientX - joy.current.cx;
        let dy = t.clientY - joy.current.cy;
        const len = Math.hypot(dx, dy);
        if (len > STICK) {
          dx = (dx / len) * STICK;
          dy = (dy / len) * STICK;
        }
        input.joyX = dx / STICK;
        input.joyY = dy / STICK;
        setStick({ x: dx, y: dy, active: true });
      } else if (look.current && t.identifier === look.current.id) {
        input.lookX += (t.clientX - look.current.x) * 2.5;
        input.lookY += (t.clientY - look.current.y) * 2.5;
        look.current = { id: t.identifier, x: t.clientX, y: t.clientY };
      }
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    for (const t of Array.from(e.changedTouches)) {
      if (joy.current && t.identifier === joy.current.id) {
        joy.current = null;
        input.joyX = 0;
        input.joyY = 0;
        setStick({ x: 0, y: 0, active: false });
      } else if (look.current && t.identifier === look.current.id) {
        look.current = null;
      }
    }
  };

  const btn = "pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full border border-foreground/30 bg-background/60 font-display text-sm text-foreground backdrop-blur active:bg-primary/40";

  return (
    <div
      className="fixed inset-0 z-20 touch-none select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Joystick base */}
      <div className="pointer-events-none absolute bottom-8 left-8 h-32 w-32 rounded-full border border-foreground/25 bg-background/40 backdrop-blur">
        <div
          className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full bg-foreground/70"
          style={{ transform: `translate(calc(-50% + ${stick.x}px), calc(-50% + ${stick.y}px))` }}
        />
      </div>
      {/* Action buttons */}
      <div className="absolute bottom-8 right-6 flex flex-col items-end gap-3">
        <button
          className={btn}
          onTouchStart={(e) => {
            e.stopPropagation();
            input.jump = true;
          }}
        >
          Jump
        </button>
        <div className="flex gap-3">
          <button
            className={`${btn} ${crouch ? "bg-primary/50" : ""}`}
            onTouchStart={(e) => {
              e.stopPropagation();
              setCrouch((c) => !c);
            }}
          >
            Crouch
          </button>
          <button
            className={`${btn} ${sprint ? "bg-primary/50" : ""}`}
            onTouchStart={(e) => {
              e.stopPropagation();
              setSprint((s) => !s);
            }}
          >
            Sprint
          </button>
        </div>
      </div>
    </div>
  );
}
