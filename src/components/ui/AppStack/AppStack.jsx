import { forwardRef } from "react";
import StackRoot from "./AppStackRoot";

/* =========================================================
   STACK

   MUI dropped system props from Stack, so `alignItems` and
   friends written as plain props are now silently dropped on the
   floor (and leak to the DOM). Call sites all over the app still
   write them that way, so fold them back into sx here instead of
   rewriting every one of them.
========================================================= */

const SYSTEM_PROPS = new Set([
  "alignContent",
  "alignItems",
  "alignSelf",
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  "justifyContent",
  "justifyItems",
  "justifySelf",
  "order",
  "height",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
  "width",
]);

const Stack = forwardRef(
  /* Margin-based spacing (MUI's default) double-counts on a
     wrapping row, so stacks here space with CSS gap. */
  ({ children, sx, useFlexGap = true, ...rest }, ref) => {
    const systemSx = {};
    const props = {};

    Object.entries(rest).forEach(([key, value]) => {
      if (SYSTEM_PROPS.has(key) && value !== undefined) {
        systemSx[key] = value;
      } else {
        props[key] = value;
      }
    });

    /* sx from the call site wins over the shorthand props. */
    const mergedSx = Array.isArray(sx)
      ? [systemSx, ...sx]
      : { ...systemSx, ...sx };

    return (
      <StackRoot
        ref={ref}
        useFlexGap={useFlexGap}
        sx={mergedSx}
        {...props}
      >
        {children}
      </StackRoot>
    );
  },
);

Stack.displayName = "Stack";

export default Stack;
