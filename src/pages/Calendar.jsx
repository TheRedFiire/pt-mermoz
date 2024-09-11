import React, { useState, useEffect } from "react";
import Task from "../components/Task";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons"; // Import des icônes

const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const hoursOfDay = Array.from({ length: 24 }, (_, index) => {
  const hour = Math.floor((8 * 60 + 30 * index) / 60);
  const minute = (30 * index) % 60;
  return `${hour}:${minute.toString().padStart(2, "0")}`;
});
const filteredHoursOfDay = hoursOfDay.filter((hour) => !hour.includes(":30"));

const TimeTable = () => {
  const [selectedColleGroup, setSelectedColleGroup] = useState(
    localStorage.getItem("selectedColleGroup") || "G1A1"
  );
  const [selectedGroup, setSelectedGroup] = useState("A");
  const [selectedNumber, setSelectedNumber] = useState("1");
  const [weekData, setWeekData] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [colleTasks, setColleTasks] = useState([]); // Nouvelle variable pour les colles
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay() - 1);
  const [colloscopeData, setColloscopeData] = useState([]);

  // Détermination de la semaine A ou B
  const getWeekParity = () => {
    const currentWeekNumber = getWeekNumber(new Date());
    return currentWeekNumber % 2 === 0 ? "A" : "B";
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const [currentWeek, setCurrentWeek] = useState(getWeekParity());

  useEffect(() => {
    const savedColleGroup = localStorage.getItem("selectedColleGroup");
    if (savedColleGroup) {
      setSelectedColleGroup(savedColleGroup);
      const colle_group = selectedColleGroup
      console.log(colle_group)
      setSelectedNumber(colle_group.charAt(1));
      setSelectedGroup(colle_group.charAt(2));
    }
  }, []);

  useEffect(() => {
    const loadWeekData = async () => {
      try {
        const response = await fetch("/pt-mermoz/config/week.json");
        const data = await response.json();
        setWeekData(data);

        const colloscopeResponse = await fetch("/pt-mermoz/documents/colloscope_data.json");
        const colloscopeData = await colloscopeResponse.json();
        setColloscopeData(colloscopeData); // Load colloscope data
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
      setWeeklyTasks(tasks); // Stocker les tâches régulières
    }
  }, [weekData]);

  const getMonday = (date) => {
    const day = date.getDay(),
      diff = date.getDate() - day + (day === 0 ? -6 : 1); // Ajuster si le jour est dimanche
    const monday = new Date(date.setDate(diff));
  
    // Formater la date en yyyy-mm-dd
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0'); // Les mois commencent à 0
    const dayOfMonth = String(monday.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${dayOfMonth}`; // Format 'yyyy-mm-dd'
  };
  
  useEffect(() => {
    const today = new Date();
    const mondayDate = getMonday(today); // Obtenir la date du lundi au format yyyy-mm-dd
  
    if (colloscopeData.length > 0) {
      const filteredColles = colloscopeData.filter((colle) =>
        colle.groups.some((group, index) => 
          group === selectedColleGroup && colle.dates[index] === mondayDate
        )
      );
  
      const collesTasks = filteredColles.map((colle) => ({
        subject: colle.subject, // Retire le dernier caractère du sujet
        professor: colle.professor,
        room: colle.room,
        start: colle.start,
        end: colle.end,
        day: colle.day,
        color: colle.color,
      }));
  
      setColleTasks(collesTasks); // Stocker les tâches des colles dans une variable séparée
    }
  }, [colloscopeData, selectedColleGroup]);

  const setSelectedColleGroupsWithStorage = (colle_group) => {
    setSelectedColleGroup(colle_group);
    localStorage.setItem("selectedColleGroup", colle_group);
  };

  const setSelectedWeekWithStorage = (week) => {
    setCurrentWeek(week);
    localStorage.setItem("selectedWeek", week);
  };

  const handleDayChange = (index) => {
    setCurrentDayIndex(index);
  };

  const weeks = ["A", "B"]; // Semaine A ou B
  const colle_groups = ["G1A1", "G1A2", "G1A3", "G1A4", "G1B1", "G1B2", "G1B3", "G2B4", "G2B5", "G2C1", "G2C2", "G2C3", "G2C4"]

  function isCoursePassed(day, endTime) {
    const today = new Date();
    const currentDayOfWeek = today.getDay() - 1;
    const targetDayOfWeek = daysOfWeek.indexOf(day);

    if (targetDayOfWeek > currentDayOfWeek) {
      return false;
    }

    if (targetDayOfWeek === currentDayOfWeek) {
      const [endHour, endMinutes] = endTime.split(":").map(Number);
      const courseDate = new Date(today);
      courseDate.setHours(endHour, endMinutes, 0, 0);
      return courseDate < today;
    }

    return true;
  }

  return (
    <div className={`container mx-auto my-4`}>
      <div className="flex flex-row md:space-y-0 space-x-0 md:space-x-4 justify-center items-center md:mb-4">
        <div className="flex flex-row pt-6 md:pt-0 space-x-2">
          <select
            className="p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedColleGroup}
            onChange={(e) => setSelectedColleGroupsWithStorage(e.target.value)}
          >
            {colle_groups.map((colle_group) => (
              <option key={colle_group} value={colle_group}>
                {colle_group}
              </option>
            ))}
          </select>
          <select
            className="p-2 rounded border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

      <div className="md:hidden flex flex-row flex-shrink-0 sticky top-0 w-full justify-between p-5 shadow-sm z-10 rounded-t-3xl bg-white dark:bg-gray-800">
        {daysOfWeek.map((day, index) => (
          <button
            key={day}
            className={`flex flex-col justify-center p-2 px-4 rounded-lg ${
              index === currentDayIndex ? "bg-indigo-700" : ""
            } items-center cursor-pointer z-auto`}
            onClick={() => handleDayChange(index)}
          >
            <span
              className={`text-base ${
                index === currentDayIndex ? "text-white" : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {day.slice(0, 2)}
            </span>
          </button>
        ))}
      </div>

      <div className="md:m-0 flex m-2">
        <div className="hidden md:flex flex-col bg-white dark:bg-gray-800 text-right p-2 mr-4 pt-7">
          {filteredHoursOfDay.map((hour) => (
            <div
              key={hour}
              className="h-12 flex items-center justify-end pr-2 text-gray-400 dark:text-gray-200"
            >
              {hour}
            </div>
          ))}
        </div>

        <div className="flex-grow md:grid md:grid-cols-5">
          {daysOfWeek.map((day, index) => (
            <div
              key={day}
              className={`bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-600 transform transition duration-500 ${
                index === currentDayIndex ? "block" : "hidden md:block"
              }`}
            >
              <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 p-2 border-b mb-2">
                {day}
              </h2>
              <div className="relative">
              {filteredHoursOfDay.map((hour) => (
          <div
            key={`${day}-${hour}`}
            className="h-12 border-t dark:border-gray-600 flex items-center bg-gray-100 dark:bg-gray-700"
          ></div>
        ))}
            {/* Afficher les tâches hebdomadaires */}
              {weeklyTasks.length > 0 && weeklyTasks
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
                ))}

              {/* Afficher les colles */}
              {colleTasks.length > 0 && colleTasks
                .filter((task) => task.day === day)
                .map((task) => (
                  <Task
                    key={`${task.day}-${task.start}-${task.end}-${task.subject}`}
                    day={day}
                    start={task.start}
                    end={task.end}
                    subject={task.subject.slice(0, -1)}
                    professor={task.professor}
                    room={task.room}
                    color={task.color}
                    passed={isCoursePassed(task.day, task.end)}
                  />
              ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeTable;