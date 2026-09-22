import MuiStack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";

/* MUI's default direction is column, so an absent direction is a
   column. Arrays and responsive objects count as a row if any
   breakpoint is one. */
const isRow = (direction) => {
  if (!direction) return false;

  if (typeof direction === "string") {
    return direction.startsWith("row");
  }

  return Object.values(direction).some((value) =>
    String(value).startsWith("row"),
  );
};

const StackRoot = styled(MuiStack)(({ direction }) => ({
  boxSizing: "border-box",

  /* A row nested inside another flex row has to size to its own
     content. Forcing 100% here made it claim the full width of the
     parent and shove its siblings off the edge of the card. */
  ...(isRow(direction) ? null : { width: "100%" }),
}));

export default StackRoot;
