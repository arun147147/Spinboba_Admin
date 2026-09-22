import React from "react";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppTypography from "@/components/ui/AppTypography/AppTypography";

import { colors } from "@/theme/colors";

/* =========================================================
   API NOTICE

   Says, on the page itself, which parts of it are backed by a real
   endpoint and which are sample data.

   The alternative - a page full of convincing numbers that came
   from a constant - is how a demo gets mistaken for a working
   feature. Better that an admin knows the Refunds list is not
   their refunds.

   Delete the notice when the endpoint lands; the page above it
   does not change.
========================================================= */

const AdminApiNotice = ({ note, sample = false }) => {
  if (!note) {
    return null;
  }

  return (
    <AppBox
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        px: 1.75,
        py: 1.25,
        mb: 2.5,
        borderRadius: 2,
        border: `1px solid ${
          sample ? "rgba(245,158,11,0.35)" : "rgba(59,130,246,0.25)"
        }`,
        bgcolor: sample
          ? "rgba(245,158,11,0.08)"
          : "rgba(59,130,246,0.06)",
      }}
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: 17,
          mt: "1px",
          flexShrink: 0,
          color: sample ? "#B45309" : colors.info,
        }}
      />

      <AppTypography
        variant="body2"
        sx={{
          color: sample ? "#92400E" : colors.text,
          fontWeight: 500,
        }}
      >
        {sample && (
          <AppBox component="span" sx={{ fontWeight: 800 }}>
            Sample data.{" "}
          </AppBox>
        )}

        {note}
      </AppTypography>
    </AppBox>
  );
};

export default AdminApiNotice;
