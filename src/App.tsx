import React, { useEffect, useRef, useState } from "react";
import Square from "./components/Square";
import { arrays, units } from "./helpers/util";
import { IUnit, Unit } from "./types/types";
import classes from "./style/grid.module.css";
import appClasses from "./style/app.module.css";
import { DateTime, DurationUnits } from "luxon";
import { createTheme, ThemeProvider } from "@mui/material";
import { colors as myColors } from "./theme/colors";
import { motion } from "framer-motion";
import { useWindowSize } from "./helpers/useWindowDimensions";
import Units from "./components/Units";
import squareClasses from "./style/square.module.css";

const theme = createTheme({});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unit, setUnit] = useState<IUnit>(units[0]);
  const [birthDate, setBirthDate] = useState<null | string>(null);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [diff, setDiff] = useState<number>(0);
  const [showHeader, setShowHeader] = useState(true);
  const { width } = useWindowSize();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const birthDateFromStorage = localStorage.getItem("birthDate");

    if (birthDateFromStorage) {
      const stored = DateTime.fromISO(birthDateFromStorage);

      if (stored.isValid) {
        setBirthDate(birthDateFromStorage);
        setMonth(String(stored.month));
        setDay(String(stored.day));
        setYear(String(stored.year));
      }
    }
  }, []);

  useEffect(() => {
    if (divRef.current) {
      console.log(divRef.current);
    }
  }, [divRef]);

  const clickDiv = (e: any) => {
    console.log(e.target === divRef.current);

    if (e.target === divRef.current) {
      setShowHeader((p) => !p);
    }
    // console.log(e.currentTarget.classList.contains("toggle"));
  };

  useEffect(() => {
    const end = DateTime.fromISO(new Date().toISOString());
    const start = DateTime.fromISO(birthDate as string);

    const diff = end.diff(start, unit.text.toLowerCase() as DurationUnits);

    if (unit.text === "Weeks") {
      setDiff(diff.weeks);
    }
    if (unit.text === "Months") {
      setDiff(diff.months);
    }
    if (unit.text === "Years") {
      setDiff(diff.years);
    }
  }, [birthDate, unit.text]);

  const isMobile = width <= 720;

  const getCircleDimensions = (type: Unit) => {
    if (type === "Weeks") {
      return {
        size: isMobile ? "0.6vh" : "0.8vh",
        className: squareClasses.square,
      };
    }

    if (type === "Months") {
      return {
        size: isMobile ? "1.1vh" : "2vh",
        className: squareClasses.squareMonth,
      };
    }

    if (type === "Years") {
      return {
        size: isMobile ? "4vh" : "8vh",
        className: squareClasses.squareYear,
      };
    }
  };

  const now = DateTime.now();
  const years = Array.from({ length: 121 }, (_, i) => now.year - i);

  const daysInSelectedMonth = month
    ? DateTime.fromObject({
        year: year ? Number(year) : 2000,
        month: Number(month),
      }).daysInMonth ?? 31
    : 31;
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const commitBirthDate = (m: string, d: string, y: string) => {
    if (!m || !d || !y) return;

    const picked = DateTime.fromObject({
      year: Number(y),
      month: Number(m),
      day: Number(d),
    });

    if (picked.isValid && picked.toMillis() <= now.toMillis()) {
      const iso = picked.toISODate();

      if (iso) {
        if (!birthDate) setShowHeader(false);
        setBirthDate(iso);
        localStorage.setItem("birthDate", iso);
      }
    }
  };

  // Keep the selected day valid when the month/year changes (e.g. Feb 30).
  const clampDay = (m: string, y: string) => {
    if (!m || !day) return day;

    const max =
      DateTime.fromObject({ year: y ? Number(y) : 2000, month: Number(m) })
        .daysInMonth ?? 31;

    if (Number(day) > max) {
      setDay("");
      return "";
    }

    return day;
  };

  const handleMonth = (value: string) => {
    setMonth(value);
    commitBirthDate(value, clampDay(value, year), year);
  };

  const handleDay = (value: string) => {
    setDay(value);
    commitBirthDate(month, value, year);
  };

  const handleYear = (value: string) => {
    setYear(value);
    commitBirthDate(month, clampDay(month, value), value);
  };

  return (
    <ThemeProvider theme={theme}>
        <div
          className={appClasses.app + " toggle"}
          style={{ backgroundColor: myColors.secondary }}
          ref={divRef}
          onClick={clickDiv}
        >
          {
            <motion.div className={appClasses.header}>
              <p className={appClasses.title}>
                MY LIFE IN
                <p style={{ color: "white", marginLeft: "8px" }}>
                  {unit.text.toUpperCase()}
                </p>
              </p>

              {showHeader && (
                <div className={appClasses.picker}>
                  <span className={appClasses.dobLabel}>Date of birth</span>
                  <div className={appClasses.dobFields}>
                    <select
                      className={appClasses.dobSelect}
                      value={month}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleMonth(e.target.value)}
                    >
                      <option value="">Month</option>
                      {MONTHS.map((name, i) => (
                        <option key={name} value={i + 1}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <select
                      className={appClasses.dobSelect}
                      value={day}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleDay(e.target.value)}
                    >
                      <option value="">Day</option>
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      className={appClasses.dobSelect}
                      value={year}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleYear(e.target.value)}
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Units unitState={unit} setUnit={setUnit} />
                </div>
              )}
            </motion.div>
          }
          {/* {diff ? (
            <h2>
              {Math.floor(diff)} {unit.text}
            </h2>
          ) : null} */}

          <div
            className={classes.grid}
            style={{
              gridTemplateColumns: `repeat(${unit.rowCount}, calc(1.2px + ${
                getCircleDimensions(unit.text)?.size
              })`,
              gridTemplateRows: `repeat(${unit.columnCount}, calc(1.2px + ${
                getCircleDimensions(unit.text)?.size
              })`,
            }}
          >
            {arrays[unit.text.toLowerCase()].map((_, index) => (
              <Square
                unit={unit.text}
                index={index}
                fillColor={index + 1 < (diff || 0)}
                className={getCircleDimensions(unit.text)?.className as any}
              />
            ))}
          </div>
        </div>
    </ThemeProvider>
  );
}

export default App;
