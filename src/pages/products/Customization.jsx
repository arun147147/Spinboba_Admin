import React from "react";

import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppGrid from "@/components/ui/AppGrid/AppGrid";
import AppFormControl from "@/components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "@/components/ui/AppInputLabel/AppInputLabel";
import AppSelect from "@/components/ui/AppSelect/AppSelect";
import AppMenuItem from "@/components/ui/AppMenuItem/AppMenuItem";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import useCurrency from "@/hooks/useCurrency";

const SpinBobaCustomization = ({
  customizations,
  setCustomizations,
}) => {


  const { formatPrice } = useCurrency();
  const addGroup = () => {

    setCustomizations(
      (previous) => [
        ...previous,
        {
          group_name: "",
          selection_type: "single",
          is_required: false,
          options: [],
        },
      ]
    );

  };


  const removeGroup = (groupIndex) => {

    setCustomizations(
      (previous) =>
        previous.filter(
          (_, index) =>
            index !== groupIndex
        )
    );

  };


  const updateGroup = (
    groupIndex,
    field,
    value
  ) => {

    setCustomizations(
      (previous) => {

        const updated =
          [...previous];

        updated[groupIndex] = {
          ...updated[groupIndex],
          [field]: value,
        };

        return updated;

      }
    );

  };


  const addOption = (groupIndex) => {

    setCustomizations(
      (previous) => {

        const updated =
          [...previous];

        updated[groupIndex] = {
          ...updated[groupIndex],
          options: [
            ...(updated[groupIndex].options || []),
            {
              option_name: "",
              additional_price: 0,
            },
          ],
        };

        return updated;

      }
    );

  };


  const updateOption = (
    groupIndex,
    optionIndex,
    field,
    value
  ) => {

    setCustomizations(
      (previous) => {

        const updated =
          [...previous];

        const options =
          [...updated[groupIndex].options];

        options[optionIndex] = {
          ...options[optionIndex],
          [field]: value,
        };

        updated[groupIndex] = {
          ...updated[groupIndex],
          options,
        };

        return updated;

      }
    );

  };


  const removeOption = (
    groupIndex,
    optionIndex
  ) => {

    setCustomizations(
      (previous) => {

        const updated =
          [...previous];

        updated[groupIndex] = {
          ...updated[groupIndex],
          options:
            updated[groupIndex]
              .options
              .filter(
                (_, index) =>
                  index !== optionIndex
              ),
        };

        return updated;

      }
    );

  };


  return (

    <AppCard elevation={2}>

      <AppCardContent>

        <AppStack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >

          <AppBox>

            <AppTypography
              variant="h6"
              fontWeight={600}
            >
              Customizations
            </AppTypography>

            <AppTypography
              variant="body2"
              color="text.secondary"
            >
              Configure sizes, toppings,
              ice level and sweetness.
            </AppTypography>

          </AppBox>


          <AppButton
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addGroup}
          >
            Add Group
          </AppButton>

        </AppStack>


        <AppStack spacing={3}>

          {customizations.map(
            (group, groupIndex) => (

              <AppCard
                key={groupIndex}
                variant="outlined"
              >

                <AppCardContent>

                  <AppStack spacing={2}>

                    <AppGrid
                      container
                      spacing={2}
                    >

                      <AppGrid
                        item
                        xs={12}
                        sm={5}
                      >

                        <AppTextField
                          fullWidth
                          label="Group Name"
                          placeholder="e.g. Size"
                          value={
                            group.group_name
                          }
                          onChange={(event) =>
                            updateGroup(
                              groupIndex,
                              "group_name",
                              event.target.value
                            )
                          }
                        />

                      </AppGrid>


                      <AppGrid
                        item
                        xs={12}
                        sm={4}
                      >

                        <AppFormControl
                          fullWidth
                        >

                          <AppInputLabel>
                            Selection Type
                          </AppInputLabel>

                          <AppSelect
                            value={
                              group.selection_type
                            }
                            label="Selection Type"
                            onChange={(event) =>
                              updateGroup(
                                groupIndex,
                                "selection_type",
                                event.target.value
                              )
                            }
                          >

                            <AppMenuItem value="single">
                              Single
                            </AppMenuItem>

                            <AppMenuItem value="multiple">
                              Multiple
                            </AppMenuItem>

                          </AppSelect>

                        </AppFormControl>

                      </AppGrid>


                      <AppGrid
                        item
                        xs={12}
                        sm={3}
                      >

                        <AppIconButton
                          color="error"
                          onClick={() =>
                            removeGroup(
                              groupIndex
                            )
                          }
                        >

                          <DeleteIcon />

                        </AppIconButton>

                      </AppGrid>

                    </AppGrid>


                    {/* OPTIONS */}

                    <AppTypography
                      variant="subtitle2"
                      fontWeight={600}
                    >
                      Options
                    </AppTypography>


                    <AppStack spacing={1.5}>

                      {(
                        group.options || []
                      ).map(
                        (
                          option,
                          optionIndex
                        ) => (

                          <AppGrid
                            container
                            spacing={1}
                            key={optionIndex}
                            alignItems="center"
                          >

                            <AppGrid
                              item
                              xs={7}
                            >

                              <AppTextField
                                fullWidth
                                size="small"
                                label="Option"
                                placeholder="e.g. Large"
                                value={
                                  option.option_name
                                }
                                onChange={(event) =>
                                  updateOption(
                                    groupIndex,
                                    optionIndex,
                                    "option_name",
                                    event.target.value
                                  )
                                }
                              />

                            </AppGrid>


                            <AppGrid
                              item
                              xs={3}
                            >

                              <AppTextField
                                fullWidth
                                size="small"
                                type="number"
                                label={`Extra ${formatPrice(0).replace(/\d/g, '')}`}
                                value={
                                  option.additional_price
                                }
                                onChange={(event) =>
                                  updateOption(
                                    groupIndex,
                                    optionIndex,
                                    "additional_price",
                                    Number(
                                      event.target.value
                                    )
                                  )
                                }
                              />

                            </AppGrid>


                            <AppGrid
                              item
                              xs={2}
                            >

                              <AppIconButton
                                color="error"
                                onClick={() =>
                                  removeOption(
                                    groupIndex,
                                    optionIndex
                                  )
                                }
                              >

                                <DeleteIcon />

                              </AppIconButton>

                            </AppGrid>

                          </AppGrid>

                        )
                      )}

                    </AppStack>


                    <AppButton
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() =>
                        addOption(
                          groupIndex
                        )
                      }
                    >
                      Add Option
                    </AppButton>

                  </AppStack>

                </AppCardContent>

              </AppCard>

            )
          )}

        </AppStack>

      </AppCardContent>

    </AppCard>

  );
};


export default SpinBobaCustomization;