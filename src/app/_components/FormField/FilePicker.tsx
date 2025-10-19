"use client";

import { useState, ChangeEvent } from "react";
import Icon from "../Icon";

export type Props = {
  label: string;
  help: string;
  icon: string;
  onFileChange: (files: File[]) => void;
};

const FormFilePicker = ({ label, help, icon, onFileChange }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    onFileChange(files);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isHovered
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/50"
          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type="file"
        multiple
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif, application/pdf"
      />
      <div className="flex flex-col items-center justify-center space-y-2">
        <Icon
          path={icon}
          size="48"
          className={`transition-colors ${
            isHovered ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
          }`}
        />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{help}</p>
      </div>
    </div>
  );
};

export default FormFilePicker;
