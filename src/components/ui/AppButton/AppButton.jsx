import { forwardRef } from "react";
import AppButtonRoot from "./AppButtonRoot";

const AppButton = forwardRef(
    (
        {
            children,
            color = "primary",
            variant = "contained",
            circular = false,
            loading = false,
            disabled = false,
            onClick,
            sx,
            ...rest
        },
        ref
    ) => {
        const handleClick = (event) => {
            if (!loading && !disabled && onClick) {
                onClick(event);
            }
        };

        return (
            <AppButtonRoot
                ref={ref}
                color={color}
                variant={variant}
                circular={circular}
                loading={loading}
                disabled={disabled}
                onClick={handleClick}
                sx={sx}
                {...rest}
            >
                {children}
            </AppButtonRoot>
        );
    }
);

export default AppButton;