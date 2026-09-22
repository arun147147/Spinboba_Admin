import { forwardRef } from "react";
import AppRadioGroupRoot from "./AppRadioGroupRoot";

const AppRadioGroup = forwardRef(
    (
        {
            value,
            onChange,
            row = false,
            disabled = false,
            children,
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
            <AppRadioGroupRoot
                ref={ref}
                value={value}
                row={row}
                onChange={handleChange}
                sx={sx}
                {...rest}
            >
                {children}
            </AppRadioGroupRoot>
        );
    }
);

export default AppRadioGroup;