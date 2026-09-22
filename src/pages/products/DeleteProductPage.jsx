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
import AppDialog from "@/components/ui/AppDialog/AppDialog";
import AppDialogTitle from "@/components/ui/AppDialogTitle/AppDialogTitle";
import AppDialogContent from "@/components/ui/AppDialogContent/AppDialogContent";
import AppDialogContentText from "@/components/ui/AppDialogContentText/AppDialogContentText";
import AppDialogActions from "@/components/ui/AppDialogActions/AppDialogActions";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";
import AppStack from "@/components/ui/AppStack/AppStack";
import AppTextField from "@/components/ui/AppTextField/AppTextField";
import AppToolBar from "@/components/ui/AppToolbar/AppToolbar";

import ArrowBack from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";

import {
  getSpinBobaProductByIdApi,
  deleteSpinBobaProductApi,
} from "@/api/spinbobaApi";


const DeleteSpinBobaProduct = () => {

  const navigate = useNavigate();

  const [productId, setProductId] =
    useState("");

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [openDialog, setOpenDialog] =
    useState(false);


  const handleFindProduct = async () => {

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


      if (
        response?.success &&
        response?.message
      ) {

        setProduct(
          response.message
        );

        setOpenDialog(true);

      } else {

        setError(
          response?.message ||
          "Product not found."
        );

      }

    } catch (error) {

      console.error(error);

      setError(
        "Failed to find product."
      );

    } finally {

      setLoading(false);

    }

  };


  const handleConfirmDelete = async () => {

    try {

      setLoading(true);


      const response =
        await deleteSpinBobaProductApi(
          productId
        );


      if (response?.success) {

        setOpenDialog(false);

        setProduct(null);

        setProductId("");

        alert(
          "SpinBoba product deleted successfully."
        );

        navigate(
          "/dashboard"
        );

      } else {

        setError(
          response?.message ||
          "Failed to delete product."
        );

        setOpenDialog(false);

      }

    } catch (error) {

      console.error(
        "Delete SpinBoba product error:",
        error
      );

      setError(
        "Failed to delete product."
      );

      setOpenDialog(false);

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
            Delete SpinBoba Product
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

            <AppBox
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
              }}
            >

              <WarningIcon
                sx={{
                  color: "error.main",
                  mr: 1,
                }}
              />

              <AppTypography
                variant="h5"
                fontWeight={700}
              >
                Delete SpinBoba Product
              </AppTypography>

            </AppBox>


            <AppTypography
              variant="body2"
              color="text.secondary"
              mb={3}
            >
              Enter the SpinBoba product ID
              you want to delete.
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
                disabled={loading}
              />


              <AppButton
                fullWidth
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={
                  handleFindProduct
                }
                disabled={
                  loading ||
                  !productId.trim()
                }
              >

                {loading
                  ? "Finding..."
                  : "Delete Product"}

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


      {/* ======================================================
          CONFIRM DIALOG
      ======================================================= */}

      <AppDialog
        open={openDialog}
        onClose={() =>
          !loading &&
          setOpenDialog(false)
        }
      >

        <AppDialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            color: "error.main",
          }}
        >

          <WarningIcon sx={{ mr: 1 }} />

          Confirm Delete

        </AppDialogTitle>


        <AppDialogContent>

          <AppDialogContentText>

            Are you sure you want to delete{" "}

            <strong>
              {product?.product_name}
            </strong>

            ?

            <br />

            This will also remove the
            associated images and
            customization relationships.

          </AppDialogContentText>

        </AppDialogContent>


        <AppDialogActions>

          <AppButton
            onClick={() =>
              setOpenDialog(false)
            }
            disabled={loading}
          >
            Cancel
          </AppButton>


          <AppButton
            color="error"
            variant="contained"
            onClick={
              handleConfirmDelete
            }
            disabled={loading}
            startIcon={
              loading ? (
                <AppCircularProgress
                  size={20}
                />
              ) : (
                <DeleteIcon />
              )
            }
          >

            {loading
              ? "Deleting..."
              : "Delete"}

          </AppButton>

        </AppDialogActions>

      </AppDialog>

    </AppBox>

  );

};


export default DeleteSpinBobaProduct;