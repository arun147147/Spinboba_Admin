import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import AppAlert from "@/components/ui/AppAlert/AppAlert";
import AppBar from "@/components/ui/AppBar/AppBarRoot";
import AppButton from "@/components/ui/AppButton/AppButton";
import AppCircularProgress from "@/components/ui/AppCircularProgress/AppCircularProgress";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppContainer from "@/components/ui/AppContainer/AppContainer";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppToolBar from "@/components/ui/AppToolbar/AppToolbar";
import AppTextField from "@/components/ui/AppTextField/AppTextField";

import ArrowBack from "@mui/icons-material/ArrowBack";

import {
  getSpinBobaProductByIdApi,
} from "@/api/spinbobaApi";

import SpinBobaProductForm from "./ProductForm";


const EditSpinBobaProduct = () => {

  const navigate = useNavigate();

  const [productId, setProductId] =
    useState("");

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleFetchProduct = async () => {

    if (!productId.trim()) {

      setError(
        "Please enter a product ID."
      );

      return;
    }


    try {

      setLoading(true);

      setError("");


      const response =
        await getSpinBobaProductByIdApi(
          productId
        );


if (response?.product) {
  setProduct(response.product);
} else {
  setError("SpinBoba product not found.");
}

    } catch (error) {

      console.error(
        "Fetch SpinBoba product error:",
        error
      );

      setError(
        "Failed to fetch product."
      );

    } finally {

      setLoading(false);

    }

  };


  if (product) {

    return (

      <SpinBobaProductForm
        initialProduct={product}
        mode="edit"
        onBackClick={() =>
          setProduct(null)
        }
      />

    );

  }


  return (

    <AppBox
      sx={{
        bgcolor: "grey.100",
        minHeight: "100vh",
      }}
    >

      <AppBar
        position="sticky"
        color="inherit"
        elevation={1}
      >

        <AppToolBar>

          <AppIconButton
            edge="start"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
            sx={{ mr: 2 }}
          >

            <ArrowBack />

          </AppIconButton>


          <AppTypography
            variant="h6"
            fontWeight={700}
          >
            Edit SpinBoba Product
          </AppTypography>

        </AppToolBar>

      </AppBar>


      <AppContainer
        maxWidth="sm"
        sx={{ py: 6 }}
      >

        <AppCard
          elevation={2}
          sx={{
            borderRadius: 3,
          }}
        >

          <AppCardContent sx={{ p: 4 }}>

            <AppTypography
              variant="h5"
              fontWeight={700}
              gutterBottom
            >
              Find SpinBoba Product
            </AppTypography>


            <AppTypography
              variant="body2"
              color="text.secondary"
              mb={3}
            >
              Enter the SpinBoba product ID
              you want to edit.
            </AppTypography>


            {error && (

              <AppAlert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() =>
                  setError("")
                }
              >
                {error}
              </AppAlert>

            )}


            <AppStack spacing={2}>

              <AppTextField
                fullWidth
                type="number"
                label="Product ID"
                placeholder="e.g. 1"
                value={productId}
                onChange={(event) =>
                  setProductId(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {

                  if (
                    event.key === "Enter"
                  ) {
                    handleFetchProduct();
                  }

                }}
                disabled={loading}
              />


              <AppButton
                fullWidth
                variant="contained"
                onClick={
                  handleFetchProduct
                }
                disabled={
                  loading ||
                  !productId.trim()
                }
              >

                {loading ? (

                  <>
                    <AppCircularProgress
                      size={20}
                      sx={{ mr: 1 }}
                    />

                    Fetching...

                  </>

                ) : (
                  "Fetch Product"
                )}

              </AppButton>


              <AppButton
                fullWidth
                variant="outlined"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
              >
                Back
              </AppButton>

            </AppStack>

          </AppCardContent>

        </AppCard>

      </AppContainer>

    </AppBox>

  );

};


export default EditSpinBobaProduct;