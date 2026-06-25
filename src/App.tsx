import React, { useEffect, useRef, useState } from "react";
import Square from "./components/Square";
import { arrays, units } from "./helpers/util";
import { IUnit, Unit } from "./types/types";
import classes from "./style/grid.module.css";
import appClasses from "./style/app.module.css";
import { DateTime, DurationUnits } from "luxon";
import { createTheme, ThemeProvider } from "@mui/material";
import { colors as myColors } from "./theme/colors";
import { AnimatePresence, motion } from "framer-motion";
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
  // Start collapsed (just title + grid) when a valid birth date is already
  // stored, so returning visitors don't see the picker open every load.
  const [showHeader, setShowHeader] = useState(() => {
    const stored = localStorage.getItem("birthDate");
    return !(stored && DateTime.fromISO(stored).isValid);
  });
  const { width, height } = useWindowSize();
  const divRef = useRef<HTMLDivElement>(null);
  // The first grid fade-in is a touch slower than later view switches.
  const initialLoad = useRef(true);
  const touchStart = useRef({ x: 0, y: 0 });
  const swiped = useRef(false);

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

  useEffect(() => {
    initialLoad.current = false;
  }, []);

  // Tapping the background or the calendar grid toggles the menu, unless the
  // gesture was a horizontal swipe (which switches views instead).
  const toggleMenu = () => {
    if (swiped.current) return;
    setShowHeader((p) => !p);
  };

  const clickDiv = (e: any) => {
    if (e.target === divRef.current) {
      toggleMenu();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    swiped.current = false;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    // Horizontal swipe (and clearly more horizontal than vertical) switches view.
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      const idx = units.findIndex((u) => u.text === unit.text);
      const next = idx + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < units.length) setUnit(units[next]);
    }
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

  // Size each grid track to a whole number of pixels. Fractional (vh-based)
  // tracks round inconsistently per device pixel and produce visible seams.
  const circleSizeVh = parseFloat(getCircleDimensions(unit.text)?.size ?? "0");
  const cellPx = Math.max(1, Math.round(1.2 + (circleSizeVh / 100) * height));

  return (
    <ThemeProvider theme={theme}>
        <div
          className={appClasses.app + " toggle"}
          style={{ backgroundColor: myColors.secondary }}
          ref={divRef}
          onClick={clickDiv}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {
            <motion.div
              className={appClasses.header}
              layout="position"
              transition={{ layout: { duration: 1.4, ease: [0.65, 0, 0.35, 1] } }}
            >
              <p className={appClasses.title}>
                MY LIFE IN
                <p style={{ color: "white", marginLeft: "8px" }}>
                  {unit.text.toUpperCase()}
                </p>
              </p>

              <AnimatePresence>
                {showHeader && (
                  <motion.div
                    key="picker"
                    className={appClasses.picker}
                    style={{ overflow: "hidden" }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          }
          {/* {diff ? (
            <h2>
              {Math.floor(diff)} {unit.text}
            </h2>
          ) : null} */}

          <AnimatePresence mode="popLayout">
            <motion.div
              key={unit.text}
              className={classes.grid}
              onClick={toggleMenu}
              style={{
                gridTemplateColumns: `repeat(${unit.rowCount}, ${cellPx}px)`,
                gridTemplateRows: `repeat(${unit.columnCount}, ${cellPx}px)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: initialLoad.current ? 0.8 : 1.4,
                ease: initialLoad.current
                  ? [0.4, 0, 0.2, 1]
                  : [0.65, 0, 0.35, 1],
              }}
            >
              {arrays[unit.text.toLowerCase()].map((_, index) => (
                <Square
                  key={index}
                  unit={unit.text}
                  index={index}
                  fillColor={index + 1 < (diff || 0)}
                  className={getCircleDimensions(unit.text)?.className as any}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
    </ThemeProvider>
  );
}

export default App;
