import { Button } from "@mui/material";
import React from "react";
import { units } from "../helpers/util";
import { IUnit } from "../types/types";
import { colors } from "../theme/colors";
import classes from "../style/units.module.css";

const Units = ({ unitState, setUnit }: { unitState: IUnit; setUnit: any }) => {
  return (
    <div className={classes.units}>
      {units.map((unit) => {
        const active = unit.text === unitState.text;
        return (
          <Button
            key={unit.text}
            variant={active ? "contained" : "outlined"}
            onClick={() => setUnit(unit)}
            style={{
              margin: "5px",
              color: active ? colors.secondary : "white",
              backgroundColor: active ? "white" : "transparent",
              borderColor: "white",
            }}
          >
            {unit.text}
          </Button>
        );
      })}
    </div>
  );
};

export default Units;
