import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppChip from "@/components/ui/AppChip/AppChip";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppCheckbox from "@/components/ui/AppCheckbox/AppCheckbox";
import AppRadio from "@/components/ui/AppRadio/AppRadio";
import AppRadioGroup from "@/components/ui/AppRadioGroup/AppRadioGroup";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";
import AppFormControl from "@/components/ui/AppFormControl/AppFormControl";
import AppDivider from "@/components/ui/AppDivider/AppDivider";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";
import AppAlert from "@/components/ui/AppAlert/AppAlert";

import { colors } from "@/theme/colors";

/* =========================================================
   CUSTOMIZATION GROUPS

   The groups come from customization_groups / customization_options
   in the database, never from a list in this file - so a price
   changed in the database is the price shown here.

   Turning a group on writes a row into
   product_customization_groups for this product. `is_required`
   decides whether the customer must choose before adding to cart.

   Each group renders in its own selection_type: single-select
   groups as radios, multi-select as checkboxes. These controls are
   a preview of what the customer will see - they are disabled,
   because what is being configured here is which groups the
   product offers, not which option gets picked.
========================================================= */

const CustomizationGroups = ({
  groups = [],
  selected = [],
  onChange,
  loading = false,
  error = null,
}) => {
  const findSelected = (groupId) =>
    selected.find(
      (entry) =>
        Number(entry.customization_group_id) === Number(groupId),
    );

  const toggleGroup = (group) => {
    const existing = findSelected(group.customization_group_id);

    if (existing) {
      onChange(
        selected.filter(
          (entry) =>
            Number(entry.customization_group_id) !==
            Number(group.customization_group_id),
        ),
      );

      return;
    }

    onChange([
      ...selected,
      {
        customization_group_id: group.customization_group_id,
        /* Size, Ice Level and Sweetness are required by default -
           a drink cannot be made without them. */
        is_required: ["Size", "Ice Level", "Sweetness Level"].includes(
          group.group_name,
        ),
      },
    ]);
  };

  const toggleRequired = (groupId) => {
    onChange(
      selected.map((entry) =>
        Number(entry.customization_group_id) === Number(groupId)
          ? { ...entry, is_required: !entry.is_required }
          : entry,
      ),
    );
  };

  if (loading) {
    return (
      <AppBox sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <AppCircularProgress size={26} />
      </AppBox>
    );
  }

  if (error) {
    return (
      <AppAlert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </AppAlert>
    );
  }

  if (groups.length === 0) {
    return (
      <AppAlert severity="info" sx={{ borderRadius: 2 }}>
        No customization groups are configured yet.
      </AppAlert>
    );
  }

  return (
    <AppStack spacing={2}>
      <AppTypography variant="body2" color="text.secondary">
        Choose which options this drink offers. Prices come from
        your customization settings.
      </AppTypography>

      {groups.map((group) => {
        const active = findSelected(group.customization_group_id);

        const isMulti = group.selection_type === "multiple";

        return (
          <AppBox
            key={group.customization_group_id}
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: active
                ? colors.primary
                : "rgba(0,0,0,0.10)",
              bgcolor: active ? colors.primaryLight : "transparent",
              p: { xs: 1.5, sm: 2 },
              transition: "border-color 0.2s ease",
            }}
          >
            <AppStack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexWrap: "wrap", gap: 1 }}
            >
              <AppFormControlLabel
                control={
                  <AppSwitch
                    checked={Boolean(active)}
                    onChange={() => toggleGroup(group)}
                  />
                }
                label={
                  <AppTypography
                    variant="subtitle2"
                    sx={{ fontWeight: 700 }}
                  >
                    {group.group_name}
                  </AppTypography>
                }
              />

              <AppChip
                size="small"
                variant="outlined"
                label={
                  isMulti ? "Choose many" : "Choose one"
                }
              />

              <AppBox sx={{ flex: 1 }} />

              {active && (
                <AppFormControlLabel
                  control={
                    <AppCheckbox
                      checked={Boolean(active.is_required)}
                      onChange={() =>
                        toggleRequired(
                          group.customization_group_id,
                        )
                      }
                    />
                  }
                  label={
                    <AppTypography variant="caption">
                      Required
                    </AppTypography>
                  }
                />
              )}
            </AppStack>

            {active && (
              <>
                <AppDivider sx={{ my: 1.5 }} />

                <AppFormControl component="fieldset" fullWidth>
                  {isMulti ? (
                    <AppStack
                      sx={{ flexWrap: "wrap" }}
                      direction="row"
                    >
                      {group.options.map((option) => (
                        <AppFormControlLabel
                          key={option.customization_option_id}
                          control={<AppCheckbox disabled />}
                          label={
                            <OptionLabel option={option} />
                          }
                          sx={{ width: { xs: "100%", sm: "50%" }, m: 0 }}
                        />
                      ))}
                    </AppStack>
                  ) : (
                    <AppRadioGroup>
                      <AppStack
                        sx={{ flexWrap: "wrap" }}
                        direction="row"
                      >
                        {group.options.map((option) => (
                          <AppFormControlLabel
                            key={option.customization_option_id}
                            value={String(
                              option.customization_option_id,
                            )}
                            control={<AppRadio disabled />}
                            label={<OptionLabel option={option} />}
                            sx={{
                              width: { xs: "100%", sm: "50%" },
                              m: 0,
                            }}
                          />
                        ))}
                      </AppStack>
                    </AppRadioGroup>
                  )}
                </AppFormControl>
              </>
            )}
          </AppBox>
        );
      })}
    </AppStack>
  );
};

/* One option row: name on the left, surcharge on the right. */
const OptionLabel = ({ option }) => {
  const price = Number(option.additional_price) || 0;

  return (
    <AppStack
      direction="row"
      alignItems="baseline"
      spacing={0.75}
      sx={{ py: 0.25 }}
    >
      <AppTypography variant="body2">
        {option.option_name}
      </AppTypography>

      <AppTypography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: price > 0 ? colors.primaryDark : colors.grey,
        }}
      >
        +₹{price.toFixed(2)}
      </AppTypography>
    </AppStack>
  );
};

export default CustomizationGroups;
