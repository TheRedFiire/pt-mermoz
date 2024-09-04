import React, { useState, useEffect } from "react";
import Task from "../components/Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const hoursOfDay = Array.from({ length: 24 }, (_, index) => {
  const hour = Math.floor((8 * 60 + 30 * index) / 60);
  const minute = (30 * index) % 60;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
});
const filteredHoursOfDay = hoursOfDay.filter((hour) => !hour.includes(":30"));

const TimeTable = () => {
  const [selectedGroup, setSelectedGroup] = useState(
    localStorage.getItem("selectedGroup") || "A"
  );
  const [selectedNumber, setSelectedNumber] = useState(
    localStorage.getItem("selectedNumber") || "1"
  );
  const [weekData, setWeekData] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay() - 1);

  // Détermination de la semaine A ou B
  const getWeekParity = () => {
    const currentWeekNumber = getWeekNumber(new Date());
    return currentWeekNumber % 2 === 0 ? "A" : "B";
  };

  // Fonction pour obtenir le numéro de la semaine dans l'année
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const [currentWeek, setCurrentWeek] = useState(getWeekParity());

  useEffect(() => {
    const savedGroup = localStorage.getItem("selectedGroup");
    if (savedGroup) {
      setSelectedGroup(savedGroup);
    }
    const savedNumber = localStorage.getItem("selectedNumber");
    if (savedNumber) {
      setSelectedNumber(savedNumber);
    }
  }, []);

  useEffect(() => {
    const loadWeekData = async () => {
      try {
        const response = await fetch("/pt-mermoz/config/week.json");
        const data = await response.json();
        setWeekData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données JSON:", error);
      }
    };

    loadWeekData();
  }, []);

  useEffect(() => {
    if (weekData && Array.isArray(weekData.days)) {
      const tasks = [];
      weekData.days.forEach((day) => {
        day.tasks.forEach((task) => {
          tasks.push({
            ...task,
            day: day.day,
          });
        });
      });
      setWeeklyTasks(tasks);
    }
  }, [weekData]);

  const validateSelection = (group, number) => {
    if (group === "C" && number === "1") {
      return { group: "C", number: "2" };
    }
    if (group === "A" && number === "2") {
      return { group: "A", number: "1" };
    }
    return { group, number };
  };

  const setSelectedGroupWithStorage = (group) => {
    const validated = validateSelection(group, selectedNumber);
    setSelectedGroup(validated.group);
    setSelectedNumber(validated.number);
    localStorage.setItem("selectedGroup", validated.group);
    localStorage.setItem("selectedNumber", validated.number);
  };

  const setSelectedNumberWithStorage = (number) => {
    const validated = validateSelection(selectedGroup, number);
    setSelectedGroup(validated.group);
    setSelectedNumber(validated.number);
    localStorage.setItem("selectedGroup", validated.group);
    localStorage.setItem("selectedNumber", validated.number);
  };

  const setSelectedWeekWithStorage = (week) => {
    setCurrentWeek(week);
    localStorage.setItem("selectedWeek", week);
  };

  const handleDayChange = (index) => {
    setCurrentDayIndex(index);
  };

  const groups = ["A", "B", "C"];
  const numbers = ["1", "2"];
  const weeks = ["A", "B"]; // Semaine A ou B

  function isCoursePassed(day, endTime) {
    const today = new Date();
    const currentDayOfWeek = today.getDay() - 1;
    const targetDayOfWeek = daysOfWeek.indexOf(day);

    // Si le cours est un autre jour de la semaine
    if (targetDayOfWeek > currentDayOfWeek) {
      return false;
    }

    // Si le cours est aujourd'hui
    if (targetDayOfWeek === currentDayOfWeek) {
      const [endHour, endMinutes] = endTime.split(":").map(Number);
      const courseDate = new Date(today);
      courseDate.setHours(endHour, endMinutes, 0, 0);
      return courseDate < today;
    }

    // Si le cours était un jour précédent
    return true;
  }

  return (
    <div className="container mx-auto my-4">
      <div className="flex flex-row md:space-y-0 space-x-0 md:space-x-4 justify-center items-center md:mb-4">
        <div className="flex flex-row pt-6 md:pt-0 space-x-2">
          <select
            className="p-2 rounded border border-gray-300"
            value={selectedGroup}
            onChange={(e) => setSelectedGroupWithStorage(e.target.value)}
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <select
            className="p-2 rounded border border-gray-300"
            value={selectedNumber}
            onChange={(e) => setSelectedNumberWithStorage(e.target.value)}
          >
            {numbers.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
          <select
            className="p-2 rounded border border-gray-300"
            value={currentWeek}
            onChange={(e) => setSelectedWeekWithStorage(e.target.value)}
          >
            {weeks.map((week) => (
              <option key={week} value={week}>
                Semaine {week}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="md:hidden flex flex-row flex-shrink-0 sticky top-0 w-full justify-between p-5 shadow-sm z-10 rounded-t-3xl bg-white">
        {daysOfWeek.map((day, index) => (
          <button
            key={day}
            className={`flex flex-col justify-center p-2 px-4 rounded-lg ${
              index === currentDayIndex ? "bg-indigo-700" : ""
            } items-center cursor-pointer z-auto`}
            onClick={() => handleDayChange(index)}
          >
            <span className={`text-base ${index === currentDayIndex ? "text-white" : "text-gray-600"}`}>
              {day.slice(0, 2)}
            </span>
          </button>
        ))}
      </div>

      <div className="md:m-0 flex m-2">
        <div className="hidden md:flex flex-col bg-white text-right p-2 mr-4 pt-12">
          {filteredHoursOfDay.map((hour) => (
            <div key={hour} className="h-12 flex items-center justify-end pr-2 text-gray-400">
              {hour}
            </div>
          ))}
        </div>

        <div className="flex-grow md:grid md:grid-cols-5">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`bg-white rounded-lg border transform transition duration-500 ${
                index === currentDayIndex ? "block" : "hidden md:block"
              }`}
            >
              <h2 className="text-xl font-bold text-gray-700 p-2 border-b mb-2">
                {day}
              </h2>
              <div className="relative">
                {filteredHoursOfDay.map((hour) => (
                  <div
                    key={`${day}-${hour}`}
                    className="h-12 border-t flex items-center bg-gray-100"
                  ></div>
                ))}
                {weeklyTasks.length > 0 ? (
                  weeklyTasks
                    .filter((task) => task.day === day)
                    .filter(
                      (task) =>
                        task.group.includes(selectedGroup) &&
                        task.number.includes(selectedNumber) &&
                        task.week.includes(currentWeek)
                    )
                    .map((task) => (
                      <Task
                        key={`${task.day}-${task.start}-${task.end}-${task.subject}`}
                        day={day}
                        start={task.start}
                        end={task.end}
                        subject={task.subject}
                        professor={task.professor}
                        room={task.room}
                        color={task.color}
                        passed={isCoursePassed(task.day, task.end)}
                      />
                    ))
                ) : (
                  <p>Chargement des tâches...</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTable;