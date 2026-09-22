import React from "react";

import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import { colors } from "@/theme/colors";

/*
 * Screens the brief asked for that have no backend behind them
 * yet. Each names the endpoint it needs rather than showing
 * invented numbers, so the gap is visible instead of disguised.
 */
const PlaceholderPage = ({ title, description, requiredApi }) => {
  return (
    <AppBox sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <AppTypography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        {title}
      </AppTypography>

      <AppTypography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {description}
      </AppTypography>

      <AppCard
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px dashed rgba(0,0,0,0.15)",
          bgcolor: "transparent",
        }}
      >
        <AppCardContent sx={{ py: 6 }}>
          <AppStack alignItems="center" spacing={1.5}>
            <AppBox
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.04)",
                color: colors.grey,
              }}
            >
              <ConstructionOutlinedIcon />
            </AppBox>

            <AppTypography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Not built yet
            </AppTypography>

            {requiredApi && (
              <AppTypography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: "center", maxWidth: 420 }}
              >
                Needs a backend endpoint:{" "}
                <AppBox
                  component="code"
                  sx={{
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: "rgba(0,0,0,0.05)",
                    fontFamily: "monospace",
                    fontSize: 13,
                  }}
                >
                  {requiredApi}
                </AppBox>
              </AppTypography>
            )}
          </AppStack>
        </AppCardContent>
      </AppCard>
    </AppBox>
  );
};

export default PlaceholderPage;
