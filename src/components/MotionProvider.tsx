"use client";

import { LazyMotion, domMax } from "framer-motion";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function MotionProvider({ children }: Props) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}