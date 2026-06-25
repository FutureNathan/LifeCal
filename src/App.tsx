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
////
function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [unit, setUnit] = useState<IUnit>(units[0]);
  const [birthDate, setBirthDate] = useState<null | string>(null);
  const [diff, setDiff] = useState<number>(0);
  const [showHeader, setShowHeader] = useState(true);
  const { width } = useWindowSize();
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const birthDateFromStorage = localStorage.getItem("birthDate");

    if (birthDateFromStorage) {
      setBirthDate(birthDateFromStorage);
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
                  <label className={appClasses.dateLabel}>
                    Birthdate
                    <input
                      type="date"
                      className={appClasses.date}
                      max={DateTime.now().toISODate() ?? undefined}
                      value={birthDate ?? ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setBirthDate(newValue);
                        setShowHeader(false);
                        localStorage.setItem("birthDate", newValue);
                      }}
                    />
                  </label>
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
