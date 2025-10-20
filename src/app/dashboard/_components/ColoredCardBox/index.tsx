import React, { ReactNode } from "react";
import CardBox from "../../../_components/CardBox";
import { ColorKey } from "../../../_interfaces";

type Props = {
  color?: ColorKey;
  gradient?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  isHoverable?: boolean;
};

const colorVariants = {
  info: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/25",
  success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25",
  warning: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-amber-500/25",
  danger: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/25",
  contrast: "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-gray-800/25",
  light: "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-gray-200/50 dark:from-slate-800 dark:to-slate-900 dark:text-white dark:shadow-slate-800/25",
  white: "bg-white text-gray-900 shadow-gray-200/50 dark:bg-slate-900 dark:text-white dark:shadow-slate-800/25",
  adminPill: "bg-gradient-to-br from-[#5c2d88] to-[#4a246b] text-white shadow-[#5c2d88]/25",
  userPill: "bg-gradient-to-br from-[#182951] to-[#122041] text-white shadow-[#182951]/25",
  confirmation: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25",
};

const hoverVariants = {
  info: "hover:shadow-blue-500/40 hover:shadow-xl hover:-translate-y-1",
  success: "hover:shadow-emerald-500/40 hover:shadow-xl hover:-translate-y-1",
  warning: "hover:shadow-amber-500/40 hover:shadow-xl hover:-translate-y-1",
  danger: "hover:shadow-red-500/40 hover:shadow-xl hover:-translate-y-1",
  contrast: "hover:shadow-gray-800/40 hover:shadow-xl hover:-translate-y-1",
  light: "hover:shadow-gray-200/60 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-slate-800/40",
  white: "hover:shadow-gray-200/60 hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-slate-800/40",
  adminPill: "hover:shadow-[#5c2d88]/40 hover:shadow-xl hover:-translate-y-1",
  userPill: "hover:shadow-[#182951]/40 hover:shadow-xl hover:-translate-y-1",
  confirmation: "hover:shadow-emerald-500/40 hover:shadow-xl hover:-translate-y-1",
};

export default function ColoredCardBox({
  color = "white",
  gradient = true,
  className = "",
  children,
  onClick,
  isHoverable = false,
}: Props) {
  const baseClasses = "transition-all duration-300 ease-out shadow-lg";
  const colorClasses = gradient ? colorVariants[color] : "";
  const hoverClasses = isHoverable ? hoverVariants[color] : "";
  
  const combinedClassName = [
    className, // Prioritize custom className
    baseClasses,
    colorClasses,
    hoverClasses,
  ].filter(Boolean).join(" ");

  return (
    <CardBox
      className={combinedClassName}
      onClick={onClick}
      isHoverable={false} // Gestiamo l'hover internamente
    >
      {children}
    </CardBox>
  );
}