import { forwardRef } from "react";
import AppTextFieldRoot from "./AppTextFieldRoot";
import AppInputAdornment from "../AppInputAdornment/AppInputAdornment";

const AppTextField = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      defaultValue,
      onChange,

      type = "text",
      variant = "outlined",
      size = "medium",

      fullWidth = true,
      disabled = false,
      required = false,

      error = false,
      helperText = "",

      startAdornment,
      endAdornment,

      InputProps = {},
      inputProps = {},
      InputLabelProps = {},
      slotProps = {},

      sx,
      ...rest
    },
    ref
  ) => {
    const mergedInputSlotProps = {
      ...(slotProps?.input || {}),
      ...InputProps,

      startAdornment: startAdornment ? (
        <AppInputAdornment position="start">
          {startAdornment}
        </AppInputAdornment>
      ) : (
        InputProps.startAdornment || slotProps?.input?.startAdornment
      ),

      endAdornment: endAdornment ? (
        <AppInputAdornment position="end">
          {endAdornment}
        </AppInputAdornment>
      ) : (
        InputProps.endAdornment || slotProps?.input?.endAdornment
      ),
    };

    const mergedHtmlInputSlotProps = {
      ...(slotProps?.htmlInput || {}),
      ...inputProps,
    };

    /*
     * MUI removed the InputLabelProps prop, so callers passing
     * `InputLabelProps={{ shrink: true }}` were silently ignored -
     * which left the label sitting on top of the value in date and
     * time fields, where the browser always renders a placeholder.
     *
     * Forwarding it to the inputLabel slot keeps every existing
     * call site working.
     */
    const mergedInputLabelSlotProps = {
      ...(slotProps?.inputLabel || {}),
      ...InputLabelProps,

      /* A date or time input always shows its own placeholder, so
         the label has nowhere to sit unless it is shrunk. */
      ...(type === "date" || type === "time" || type === "datetime-local"
        ? { shrink: true }
        : {}),
    };

    return (
      <AppTextFieldRoot
        ref={ref}
        label={label}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        type={type}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        sx={sx}
        slotProps={{
          ...slotProps,
          input: mergedInputSlotProps,
          htmlInput: mergedHtmlInputSlotProps,
          inputLabel: mergedInputLabelSlotProps,
        }}
        {...rest}
      />
    );
  }
);

AppTextField.displayName = "AppTextField";

export default AppTextField;