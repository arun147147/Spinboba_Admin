export { API_BASE_URL, apiUrl } from "./client";
import { apiUrl } from "./client";



// ============================================================
// CUSTOMER APIs
// ============================================================

// ============================================================
// GET ALL SPIN BOBA CATEGORIES
// ============================================================

export async function getSpinBobaCategoriesApi() {
  try {
    const response = await fetch(
      apiUrl("/api/spinboba/categories")
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching categories: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("SpinBoba Categories:", data);

    return data;
  } catch (error) {
    console.error(
      "Error fetching SpinBoba categories:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET ALL SPIN BOBA PRODUCTS
// ============================================================

export async function getSpinBobaProductsApi() {
  try {
    const response = await fetch(
      apiUrl("/api/spinboba/products")
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching products: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("SpinBoba Products:", data);

    return data;
  } catch (error) {
    console.error(
      "Error fetching SpinBoba products:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET PRODUCTS BY CATEGORY
// ============================================================

export async function getSpinBobaProductsByCategoryApi(
  categoryId
) {
  try {
    const response = await fetch(
      apiUrl(
        `/api/spinboba/categories/${categoryId}/products`
      )
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching category products: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(
      "SpinBoba Category Products:",
      data
    );

    return data;
  } catch (error) {
    console.error(
      "Error fetching category products:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET PRODUCT DETAILS
// ============================================================

export async function getSpinBobaProductDetailsApi(
  productId
) {
  try {
    const response = await fetch(
      apiUrl(
        `/api/spinboba/products/${productId}`
      )
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching product details: ${response.statusText}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(
      "Error fetching product details:",
      error
    );

    throw error;
  }
}


// ============================================================
// ADMIN APIs
// ============================================================


// ============================================================
// GET SPIN BOBA PRODUCT BY ID
// ============================================================

export async function getSpinBobaProductByIdApi(
  productId
) {
  console.log(
    "Fetching Spin Boba Product By ID:",
    productId
  );

  const response = await fetch(
    apiUrl(
      `/api/spinboba/products/${productId}`
    )
  );

  if (!response.ok) {
    throw new Error(
      `Error fetching product: ${response.status}`
    );
  }

  const data = await response.json();

  console.log(
    "Spin Boba Product By ID:",
    data
  );

  return data;
}


// ============================================================
// UPDATE SPIN BOBA PRODUCT
// ============================================================

export async function updateSpinBobaProductApi(
  productId,
  productData
) {
  try {
    const response = await fetch(
      apiUrl(
        `/api/spinboba/products/${productId}`
      ),
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(productData),
      }
    );

    const data = await response.json();

    console.log(
      "Update SpinBoba Product Response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Error updating SpinBoba product: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Error updating SpinBoba product:",
      error
    );

    throw error;
  }
}


// ============================================================
// DELETE SPIN BOBA PRODUCT
// ============================================================

export async function deleteSpinBobaProductApi(
  productId
) {
  try {
    const response = await fetch(
      apiUrl(
        `/api/spinboba/products/${productId}`
      ),
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    console.log(
      "Delete SpinBoba Product Response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Error deleting SpinBoba product: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Error deleting SpinBoba product:",
      error
    );

    throw error;
  }
}


// ============================================================
// GET ALL ADMIN SPIN BOBA PRODUCTS
//
// Useful for Edit/Delete screens.
// ============================================================

export async function getAllSpinBobaProductsAdminApi() {
  try {
    const response = await fetch(
      apiUrl("/api/spinboba/products")
    );

    const data = await response.json();

    console.log(
      "Admin SpinBoba Products:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Error fetching SpinBoba products: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Error fetching admin SpinBoba products:",
      error
    );

    throw error;
  }
}


// ============================================================
// CREATE SPIN BOBA CATEGORY
// ============================================================

export async function createSpinBobaCategoryApi(
  categoryData
) {
  try {
    const response = await fetch(
      apiUrl("/api/spinboba/categories"),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(categoryData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Error creating category: ${response.statusText}`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "Error creating SpinBoba category:",
      error
    );

    throw error;
  }
}

// ============================================================
// ADD SPIN BOBA PRODUCT
// ============================================================
export const addSpinBobaProductApi = async ({
  user_id,
  productId,
  quantity,
  specialInstructions,
  selectedOptions,
}) => {

  try {

    const token = user_id ? localStorage.getItem("token") : null;

    console.log("User ID:", user_id);
    const payload = {

      user_id:
        Number(user_id),

      product_id:
        Number(productId),

      quantity:
        Number(quantity),

      special_instructions:
        specialInstructions || null,

      selected_options:
        selectedOptions || [],

      currency_code:
        "INR",
    };


    console.log(
      "Adding SpinBoba Product:",
      payload
    );


    const response = await fetch(
      "http://localhost:3000/api/spinboba/cart/add",
      {
        method: "POST",

        headers: {

          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(payload),
      }
    );


    const data =
      await response.json();


    console.log(
      "Add SpinBoba Product Response:",
      data
    );


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Failed to add Spin Boba product to cart"
      );
    }


    return data;

  } catch (error) {

    console.error(
      "Error adding SpinBoba product:",
      error
    );

    throw error;
  }
};
// ============================================================
// ADMIN: CUSTOMIZATION GROUPS
// ============================================================

/*
 * Size, Toppings, Ice Level, Sweetness Level and so on, with
 * their options and prices, straight from customization_groups /
 * customization_options. The admin product form renders whatever
 * this returns rather than a hardcoded list.
 */
export async function getCustomizationGroupsApi() {
  const response = await fetch(
    apiUrl("/api/spinboba/customization-groups")
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load customization groups"
    );
  }

  return data;
}

// ============================================================
// ADMIN: CREATE PRODUCT
// ============================================================

/*
 * Named createSpinBobaProductApi rather than add* on purpose:
 * addSpinBobaProductApi in this file adds a product to a
 * customer's cart. The Add Product form was calling that one,
 * which is why saving a new product never worked.
 */
export async function createSpinBobaProductApi(productData) {
  const response = await fetch(apiUrl("/api/spinboba/products"), {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(productData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create product");
  }

  return data;
}
