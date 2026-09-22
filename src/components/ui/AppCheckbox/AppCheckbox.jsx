import { forwardRef } from "react";
import AppCheckboxRoot from "./AppCheckboxRoot";

const AppCheckbox = forwardRef(
    (
        {
            checked = false,
            disabled = false,
            color = "primary",
            onChange,
            sx,
            ...rest
        },
        ref
    ) => {
        const handleChange = (event) => {
            if (!disabled && onChange) {
                onChange(event);
            }
        };

        return (
            <AppCheckboxRoot
                ref={ref}
                checked={checked}
                disabled={disabled}
                color={color}
                onChange={handleChange}
                sx={sx}
                {...rest}
            />
        );
    }
);

export default AppCheckbox;