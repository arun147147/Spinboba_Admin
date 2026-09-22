import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppContainer from "@/components/ui/AppContainer/AppContainer";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppGrid from "@/components/ui/AppGrid/AppGrid";
import AppMenuItem from "@/components/ui/AppMenuItem/AppMenuItem";
import AppSelect from "@/components/ui/AppSelect/AppSelect";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppFormControl from "@/components/ui/AppFormControl/AppFormControl";
import AppInputLabel from "@/components/ui/AppInputLabel/AppInputLabel";
import AppFormControlLabel from "@/components/ui/AppFormControlLabel/AppFormControlLabel";
import AppSwitch from "@/components/ui/AppSwitch/AppSwitch";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppDivider from "@/components/ui/AppDivider/AppDivider";

import ArrowBack from "@mui/icons-material/ArrowBack";

import SpinBobaMediaUploader from "./MediaUploader";
import SpinBobaCustomization from "./Customization";
import CustomizationGroups from "./CustomizationGroups";

import {
  getSpinBobaCategoriesApi,
  createSpinBobaProductApi,
  updateSpinBobaProductApi,
  getCustomizationGroupsApi,
} from "@/api/spinbobaApi";
import useCurrency from "@/hooks/useCurrency";

const initialProduct = {
  product_name: "",
  category_id: "",
  description: "",
  base_price: "",
  discount_price: "",
  allow_customization: true,
  is_available: true,
  special_instructions: "",
};


const SpinBobaProductForm = ({
  initialProduct: existingProduct = null,
  mode = "add",
  onBackClick = null,
}) => {

  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const isEditMode =
    mode === "edit" && existingProduct;

  const [product, setProduct] = useState(() => {

    if (!isEditMode) {
      return initialProduct;
    }

    return {
      product_id: existingProduct.product_id,

      product_name:
        existingProduct.product_name || "",

      category_id:
        existingProduct.category_id || "",

      description:
        existingProduct.description || "",

      base_price:
        existingProduct.base_price || "",

      discount_price:
        existingProduct.discount_price || "",

      allow_customization:
        existingProduct.allow_customization !== undefined
          ? existingProduct.allow_customization
          : true,

      is_available:
        existingProduct.is_available !== undefined
          ? existingProduct.is_available
          : true,
    };
  });


  const [categories, setCategories] = useState([]);

  const [mediaFiles, setMediaFiles] = useState(
    existingProduct?.images || []
  );

  const [customizations, setCustomizations] = useState(
    existingProduct?.customizations || []
  );

  /* The catalogue from the database, and which of it this product
     offers. */
  const [availableGroups, setAvailableGroups] = useState([]);

  const [groupsLoading, setGroupsLoading] = useState(true);

  const [groupsError, setGroupsError] = useState(null);

  const [selectedGroups, setSelectedGroups] = useState(
    existingProduct?.customization_groups || []
  );

  const [submitStatus, setSubmitStatus] = useState(null);

  const [submitMessage, setSubmitMessage] = useState("");

  const [loading, setLoading] = useState(false);


  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {

    const loadCategories = async () => {

      try {

        const response =
          await getSpinBobaCategoriesApi();

        if (response?.success) {

          setCategories(
            response.message || []
          );

        } else {

          setCategories(
            Array.isArray(response)
              ? response
              : []
          );
        }

      } catch (error) {

        console.error(
          "Failed to load SpinBoba categories:",
          error
        );

      }

    };

    loadCategories();

  }, []);


  // ============================================================
  // HANDLE PRODUCT CHANGE
  // ============================================================

  /* =======================================================
     LOAD CUSTOMIZATION GROUPS
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadGroups = async () => {
      setGroupsLoading(true);
      setGroupsError(null);

      try {
        const response = await getCustomizationGroupsApi();

        if (!cancelled) {
          setAvailableGroups(response?.data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setGroupsError(
            error.message || "Unable to load customization groups",
          );
        }
      } finally {
        if (!cancelled) {
          setGroupsLoading(false);
        }
      }
    };

    loadGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleProductChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setProduct((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {

    if (onBackClick) {

      onBackClick();

      return;
    }

    navigate("/dashboard");

  };


  // ============================================================
  // RESET
  // ============================================================

  const clearForm = () => {

    setProduct(initialProduct);

    setMediaFiles([]);

    setCustomizations([]);
    setSelectedGroups([]);

    setSubmitStatus(null);

    setSubmitMessage("");

  };


  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {

    if (!product.product_name.trim()) {

      setSubmitStatus("error");

      setSubmitMessage(
        "Product name is required."
      );

      return;
    }


    if (!product.category_id) {

      setSubmitStatus("error");

      setSubmitMessage(
        "Please select a category."
      );

      return;
    }


    if (
      !product.base_price ||
      Number(product.base_price) < 0
    ) {

      setSubmitStatus("error");

      setSubmitMessage(
        "Please enter a valid base price."
      );

      return;
    }


    if (
      product.discount_price &&
      Number(product.discount_price) >
        Number(product.base_price)
    ) {

      setSubmitStatus("error");

      setSubmitMessage(
        "Discount price cannot be greater than base price."
      );

      return;
    }


    try {

      setLoading(true);

      setSubmitStatus(null);


      const payload = {

        ...product,

        base_price:
          Number(product.base_price),

        discount_price:
          product.discount_price
            ? Number(product.discount_price)
            : null,

        images: mediaFiles
          .map(
            (item) =>
              item.dataUrl ||
              item.image_url ||
              item.preview ||
              item
          )
          .filter(Boolean),

        customizations,

        /* Which groups this product offers, written into
           product_customization_groups by the backend. */
        customization_groups: selectedGroups,

        special_instructions:
          product.special_instructions || null,

      };


      console.log(
        "SpinBoba Product Payload:",
        payload
      );


      let response;


      if (isEditMode) {

        response =
          await updateSpinBobaProductApi(
            product.product_id,
            payload
          );

      } else {

        /*
         * createSpinBobaProductApi, not addSpinBobaProductApi -
         * that one adds a product to a customer's cart, which is
         * what this form used to call.
         */
        response =
          await createSpinBobaProductApi(
            payload
          );
      }


      if (response?.success) {

        setSubmitStatus("success");

        setSubmitMessage(
          isEditMode
            ? "SpinBoba product updated successfully."
            : "SpinBoba product added successfully."
        );


        if (!isEditMode) {

          setTimeout(() => {

            clearForm();

          }, 1500);

        } else {

          setTimeout(() => {

            handleBack();

          }, 1500);

        }

      } else {

        setSubmitStatus("error");

        setSubmitMessage(
          response?.message ||
          "Unable to save SpinBoba product."
        );

      }

    } catch (error) {

      console.error(
        "SpinBoba product save error:",
        error
      );

      setSubmitStatus("error");

      setSubmitMessage(
        error?.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <AppBox
      sx={{
        bgcolor: "grey.100",
        minHeight: "100vh",
      }}
    >

      {/* ======================================================
          HEADER
      ======================================================= */}

      <AppBox
        sx={{
          bgcolor: "white",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >

        <AppContainer
          maxWidth="xl"
          sx={{ py: 2 }}
        >

          <AppStack
            direction="row"
            alignItems="center"
            spacing={2}
          >

            <AppIconButton
              onClick={handleBack}
            >
              <ArrowBack />
            </AppIconButton>

            <AppTypography
              variant="h6"
              fontWeight={700}
            >
              {isEditMode
                ? "Edit SpinBoba Product"
                : "Add SpinBoba Product"}
            </AppTypography>

          </AppStack>

        </AppContainer>

      </AppBox>


      <AppContainer
        maxWidth="xl"
        sx={{ py: 4 }}
      >

        <AppTypography
          variant="h4"
          fontWeight={700}
          gutterBottom
        >
          {isEditMode
            ? "Edit SpinBoba Product"
            : "Add SpinBoba Product"}
        </AppTypography>


        <AppTypography
          variant="body1"
          color="text.secondary"
          mb={4}
        >
          Manage product details, pricing,
          images and customizations.
        </AppTypography>


        {submitStatus && (

          <AppAlert
            severity={submitStatus}
            sx={{ mb: 3 }}
            onClose={() =>
              setSubmitStatus(null)
            }
          >
            {submitMessage}
          </AppAlert>

        )}


        <AppGrid
          container
          spacing={3}
        >

          {/* ==================================================
              LEFT
          =================================================== */}

          <AppGrid
            item
            xs={12}
            md={8}
          >

            <AppStack spacing={3}>

              {/* PRODUCT INFORMATION */}

              <AppCard elevation={2}>

                <AppCardContent>

                  <AppTypography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                  >
                    Product Information
                  </AppTypography>


                  <AppStack spacing={2}>

                    <AppTextField
                      fullWidth
                      required
                      name="product_name"
                      label="Product Name"
                      placeholder="e.g. Brown Sugar Boba Milk Tea"
                      value={
                        product.product_name
                      }
                      onChange={
                        handleProductChange
                      }
                    />


                    <AppFormControl fullWidth>

                      <AppInputLabel>
                        Category
                      </AppInputLabel>

                      <AppSelect
                        name="category_id"
                        value={
                          product.category_id || ""
                        }
                        label="Category"
                        onChange={
                          handleProductChange
                        }
                      >

                        <AppMenuItem value="">
                          <em>
                            Select Category
                          </em>
                        </AppMenuItem>

                        {categories.map(
                          (category) => (

                            <AppMenuItem
                              key={
                                category.category_id
                              }
                              value={
                                category.category_id
                              }
                            >
                              {
                                category.category_name
                              }
                            </AppMenuItem>

                          )
                        )}

                      </AppSelect>

                    </AppFormControl>


                    <AppTextField
                      fullWidth
                      multiline
                      minRows={5}
                      name="description"
                      label="Description"
                      placeholder="Describe the SpinBoba drink..."
                      value={
                        product.description
                      }
                      onChange={
                        handleProductChange
                      }
                    />

                  </AppStack>

                </AppCardContent>

              </AppCard>


              {/* PRICING */}

              <AppCard elevation={2}>

                <AppCardContent>

                  <AppTypography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                  >
                    Pricing
                  </AppTypography>


                  <AppGrid
                    container
                    spacing={2}
                  >

                    <AppGrid
                      item
                      xs={12}
                      sm={6}
                    >

                      <AppTextField
                        fullWidth
                        required
                        type="number"
                        name="base_price"
                        label="Base Price"
                        value={
                          product.base_price
                        }
                        onChange={
                          handleProductChange
                        }
                        InputProps={{
                          startAdornment:
                            formatPrice(0).replace(/\d/g, ''),
                        }}
                      />

                    </AppGrid>


                    <AppGrid
                      item
                      xs={12}
                      sm={6}
                    >

                      <AppTextField
                        fullWidth
                        type="number"
                        name="discount_price"
                        label="Discount Price"
                        value={
                          product.discount_price
                        }
                        onChange={
                          handleProductChange
                        }
                        InputProps={{
                          startAdornment:
                            formatPrice(0).replace(/\d/g, ''),
                        }}
                      />

                    </AppGrid>

                  </AppGrid>

                </AppCardContent>

              </AppCard>


              {/* MEDIA */}

              <SpinBobaMediaUploader
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
              />


              {/* ==========================================
                  CUSTOMIZATION OPTIONS
              =========================================== */}

              {product.allow_customization && (
                <AppCard elevation={2}>
                  <AppCardContent>
                    <AppTypography
                      variant="h6"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      Customization Options
                    </AppTypography>

                    <AppTypography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2.5 }}
                    >
                      Size, Toppings, Ice Level and Sweetness Level.
                    </AppTypography>

                    <CustomizationGroups
                      groups={availableGroups}
                      selected={selectedGroups}
                      onChange={setSelectedGroups}
                      loading={groupsLoading}
                      error={groupsError}
                    />

                    <AppDivider sx={{ my: 3 }} />

                    {/* SPECIAL INSTRUCTIONS */}

                    <AppTypography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Special Instructions
                    </AppTypography>

                    <AppTextField
                      fullWidth
                      multiline
                      minRows={3}
                      name="special_instructions"
                      value={product.special_instructions || ""}
                      onChange={handleProductChange}
                      placeholder="Example: No pepper / sugar / salt please."
                      helperText="Default preparation note for this drink. Customers add their own note at checkout."
                    />

                    {/* Kept available for anything the standard
                        groups do not cover. */}
                    <AppDivider sx={{ my: 3 }} />

                    <AppTypography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 1 }}
                    >
                      Custom Groups (advanced)
                    </AppTypography>

                    <SpinBobaCustomization
                      customizations={customizations}
                      setCustomizations={setCustomizations}
                    />
                  </AppCardContent>
                </AppCard>
              )}

            </AppStack>

          </AppGrid>


          {/* ==================================================
              RIGHT
          =================================================== */}

          <AppGrid
            item
            xs={12}
            md={4}
          >

            <AppStack spacing={3}>

              {/* STATUS */}

              <AppCard elevation={2}>

                <AppCardContent>

                  <AppTypography
                    variant="h6"
                    fontWeight={600}
                    mb={2}
                  >
                    Status
                  </AppTypography>


                  <AppStack spacing={1}>

                    <AppFormControlLabel
                      control={
                        <AppSwitch
                          checked={
                            product.is_available
                          }
                          onChange={(event) =>
                            setProduct(
                              (previous) => ({
                                ...previous,
                                is_available:
                                  event.target.checked,
                              })
                            )
                          }
                        />
                      }
                      label="Available"
                    />


                    <AppFormControlLabel
                      control={
                        <AppSwitch
                          checked={
                            product.allow_customization
                          }
                          onChange={(event) =>
                            setProduct(
                              (previous) => ({
                                ...previous,
                                allow_customization:
                                  event.target.checked,
                              })
                            )
                          }
                        />
                      }
                      label="Allow Customization"
                    />

                  </AppStack>

                </AppCardContent>

              </AppCard>


              {/* SAVE */}

              <AppButton
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                onClick={handleSubmit}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                }}
              >

                {loading
                  ? "Saving..."
                  : isEditMode
                  ? "Update SpinBoba Product"
                  : "Save SpinBoba Product"}

              </AppButton>


              <AppButton
                variant="outlined"
                size="large"
                fullWidth
                onClick={handleBack}
                disabled={loading}
              >
                Cancel
              </AppButton>

            </AppStack>

          </AppGrid>

        </AppGrid>

      </AppContainer>

    </AppBox>
  );
};


export default SpinBobaProductForm;