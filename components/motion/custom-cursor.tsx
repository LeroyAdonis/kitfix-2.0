"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

const DOT_SIZE = 8;
const CIRCLE_SIZE = 32;
const CIRCLE_HOVER_SIZE = 48;
const SPRING_CONFIG = { damping: 25, stiffness: 250, mass: 0.5 };

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, SPRING_CONFIG);
  const springY = useSpring(cursorY, SPRING_CONFIG);

  useEffect(() => {
    // Detect touch device
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    if (hasCoarsePointer) {
      setIsTouchDevice(true);
      return;
    }
    setIsTouchDevice(false);

    // Set cursor: none on body
    document.body.style.cursor = "none";

    function handleMouseMove(e: globalThis.MouseEvent) {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    }

    function handleMouseLeave() {
      setIsVisible(false);
    }

    function handleMouseOver(e: globalThis.MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setIsHovering(true);
      }
    }

    function handleMouseOut(e: globalThis.MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setIsHovering(false);
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cursorX, cursorY]);

  if (isTouchDevice || shouldReduceMotion) return null;

  const circleSize = isHovering ? CIRCLE_HOVER_SIZE : CIRCLE_SIZE;

  return (
    <>
      {/* Dot: follows cursor exactly */}
      <motion.div
        data-slot="custom-cursor-dot"
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full bg-primary"
        style={{
          width: DOT_SIZE,
          height: DOT_SIZE,
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* Circle: follows with spring delay */}
      <motion.div
        data-slot="custom-cursor-circle"
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full border-2 border-primary"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          width: circleSize,
          height: circleSize,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
