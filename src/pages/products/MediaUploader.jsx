import React, { useRef } from "react";

import AppButton from "@/components/ui/AppButton/AppButton";
import AppTypography from "@/components/ui/AppTypography/AppTypography";
import AppCard from "@/components/ui/AppCard/AppCard";
import AppCardContent from "@/components/ui/AppCardContent/AppCardContent";
import AppBox from "@/components/ui/AppBox/AppBox";
import AppIconButton from "@/components/ui/AppIconButton/AppIconButton";

import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";


const SpinBobaMediaUploader = ({
  mediaFiles,
  setMediaFiles,
}) => {

  const fileInputRef = useRef(null);


  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          reader.error ||
          new Error("Unable to read file.")
        );

      reader.readAsDataURL(file);

    });


  const handleAddFiles = () => {

    fileInputRef.current?.click();

  };


  const handleFileChange = async (event) => {

    const selectedFiles =
      Array.from(event.target.files || []);


    const filesWithPreview =
      await Promise.all(

        selectedFiles.map(
          async (file) => {

            const dataUrl =
              await fileToDataUrl(file);

            return {
              file,
              dataUrl,
              preview: dataUrl,
            };

          }
        )

      );


    setMediaFiles(
      (previous) => [
        ...previous,
        ...filesWithPreview,
      ]
    );


    event.target.value = "";

  };


  const handleAddUrl = () => {

    const url = window.prompt(
      "Enter Cloudinary image URL:"
    );


    if (!url?.trim()) {
      return;
    }


    setMediaFiles(
      (previous) => [
        ...previous,
        {
          file: {
            type: "url",
          },
          dataUrl: url.trim(),
          preview: url.trim(),
        },
      ]
    );

  };


  const removeFile = (index) => {

    setMediaFiles(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    );

  };


  return (

    <AppCard elevation={2}>

      <AppCardContent>

        <AppTypography
          variant="h6"
          fontWeight={600}
          mb={2}
        >
          Product Images
        </AppTypography>


        <AppBox
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >

          <AppButton
            variant="contained"
            startIcon={
              <AddPhotoAlternateIcon />
            }
            onClick={handleAddFiles}
          >
            Add Images
          </AppButton>


          <AppButton
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={handleAddUrl}
          >
            Add Cloudinary URL
          </AppButton>


          <AppTypography
            variant="body2"
            color="text.secondary"
            mt={2}
          >
            Upload product images or add
            an existing Cloudinary URL.
          </AppTypography>


          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />

        </AppBox>


        {mediaFiles.length > 0 && (

          <AppBox
            sx={{
              mt: 3,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill,minmax(140px,1fr))",
              gap: 2,
            }}
          >

            {mediaFiles.map(
              (item, index) => {

                const preview =
                  item.preview ||
                  item.dataUrl ||
                  item.image_url ||
                  item;


                return (

                  <AppBox
                    key={index}
                    sx={{
                      position: "relative",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >

                    <img
                      src={preview}
                      alt={`SpinBoba ${index + 1}`}
                      style={{
                        width: "100%",
                        height: 140,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />


                    <AppIconButton
                      size="small"
                      onClick={() =>
                        removeFile(index)
                      }
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        bgcolor: "white",
                      }}
                    >

                      <DeleteIcon color="error" />

                    </AppIconButton>

                  </AppBox>

                );

              }
            )}

          </AppBox>

        )}

      </AppCardContent>

    </AppCard>

  );
};


export default SpinBobaMediaUploader;