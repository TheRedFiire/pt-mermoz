import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faFlask,
  faLanguage,
  faLaptopCode,
  faGears,
  faSquareRootVariable,
  faClock,
  faLocationDot,
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import {
  faOctopusDeploy
} from "@fortawesome/free-brands-svg-icons"

const Task = ({ start, end, subject, professor, room, color, passed }) => {
  const [isHovered, setIsHovered] = useState(false);

  const timeToPosition = (time) => {
    const [hour, minutes] = time.split(":").map(Number);
    return (((hour - 8) * 60 + minutes) / 60) * 48;
  };

  const top = timeToPosition(start);
  const height = timeToPosition(end) - top;

  const darkenColor = (hexColor, percent) => {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
      console.error("Invalid hex color:", hexColor);
      return hexColor;
    }

    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    r = parseInt(r * (1 - percent / 100));
    g = parseInt(g * (1 - percent / 100));
    b = parseInt(b * (1 - percent / 100));

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  };

  const hoverColor = darkenColor(color, 10);
  const alignement = height >= 96 ? "flex-col" : "flex-row space-x-2";
  const finalColor = passed ? "#B0BEC5" : isHovered ? hoverColor : color;

  const newName = {
    "TP INFO Salle B306": "TP INFO",
    "Soutien SI": "Sout. Si",
  };

  const subjectIcon = {
    "Maths": faSquareRootVariable,
    "Math": faSquareRootVariable,
    "TD Maths": faSquareRootVariable,
    "Physique-Chimie": faFlask,
    "TD Physique": faFlask,
    "TP Physique": faFlask,
    "Physique": faFlask,
    "Français": faBook,
    "Francais": faBook,
    "Info": faLaptopCode,
    "SI": faGears,
    "Cours SI": faGears,
    "TD SI": faGears,
    "TP SI": faGears,
    "Anglais": faLanguage,
    "TD Info": faLaptopCode,
    "TIPE": faMicrochip,
    "Devoir surveillé": faOctopusDeploy
  }[subject];

  return (
    <div
      className={`absolute left-0 w-full border border-white dark:border-transparent text-white ${finalColor} ${
        passed ? "opacity-50" : ""
      } shadow-lg rounded-lg p-2 transition-all duration-300 flex flex-col justify-center`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: isHovered ? hoverColor : color,
        ...(passed && {
          backgroundImage:
            "linear-gradient(135deg, rgba(128, 128, 128, 0.2) 25%, transparent 25%, transparent 50%, rgba(128, 128, 128, 0.2) 50%, rgba(128, 128, 128, 0.2) 75%, transparent 75%, transparent)",
          backgroundSize: "20px 20px",
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-center h-full">
        <div className="flex flex-row items-center justify-center font-bold space-x-2 text-xs md:text-sm">
          {subjectIcon && (
            <FontAwesomeIcon icon={subjectIcon} className="text-xs md:text-sm" />
          )}
          <h2 className="truncate text-base">
            {newName[subject] || subject} {professor && `- ${professor}`}
          </h2>
        </div>
        <div className={`flex ${alignement} items-center justify-between text-xs md:text-sm mt-1`}>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faClock} className="text-xs md:text-sm" />
            <span className="truncate">{`${start} - ${end}`}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faLocationDot} className="text-xs md:text-sm" />
            <span className="truncate">{room}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;