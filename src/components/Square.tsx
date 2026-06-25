import React from "react";
import classes from "../style/square.module.css";
import { colors } from "../theme/colors";
import { Unit } from "../types/types";

const Square = ({
  fillColor,
  index,
  className,
  unit,
}: {
  fillColor: boolean;
  index: number;
  className: string;
  unit: Unit;
}) => {
  const backgroundColor = fillColor ? "white" : colors.secondary;
  const shouldPrint = index % 260 === 0;

  return (
    <div className={classes.squareContainer}>
      <div className={className} style={{ backgroundColor }} />
      {shouldPrint && unit === "Weeks" && (
        <p className={classes.number}>{(index * 5) / 260} </p>
      )}
    </div>
  );
};

export default Square;
