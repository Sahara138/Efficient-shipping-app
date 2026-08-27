import {
  Page,
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Divider,
  EmptyState,
  Box,
  Checkbox,
  Select,
  TextField,
} from "@shopify/polaris";

import { Form, useLoaderData, useNavigation } from "@remix-run/react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { useState } from "react";

import { authenticate } from "../shopify.server";

/* =========================================================
   COMPONENTS
========================================================= */

import CreateProductModal from "../components/products/CreateProductModal";
import EditProductModal from "../components/products/EditProductModal";
import DeleteProductModal from "../components/products/DeleteProductModal";
import ProductRow from "../components/products/ProductRow";
import { Product } from "app/types/product";

/* =========================================================
   LOADER
========================================================= */

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const url = new URL(request.url);

  const searchQuery = url.searchParams.get("query") || "";

  const after = url.searchParams.get("after") || null;

  const before = url.searchParams.get("before") || null;

  const direction = url.searchParams.get("direction") || "next";

  /* -------------------------------------------------------
     PAGINATION VARIABLES
  ------------------------------------------------------- */

  const variables =
    direction === "previous"
      ? {
          last: 10,
          before,
          query: searchQuery,
        }
      : {
          first: 10,
          after,
          query: searchQuery,
        };

  /* -------------------------------------------------------
     GRAPHQL
  ------------------------------------------------------- */

  const response = await admin.graphql(
    `#graphql
      query GetProducts(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $query: String!
      ) {
        products(
          first: $first
          after: $after
          last: $last
          before: $before
          query: $query
          sortKey: CREATED_AT
          reverse: true
        ) {
          nodes {
            id
            title
            description
            handle
            productType
            vendor
            tags
            status
            createdAt
            updatedAt

            featuredImage {
              url
              altText
            }
          }

          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `,
    {
      variables,
    },
  );

  const data = await response.json();

  return {
    products: data.data.products.nodes as Product[],

    pageInfo: data.data.products.pageInfo,

    searchQuery,
  };
}

/* =========================================================
   ACTION
========================================================= */

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const intent = formData.get("intent");

  /* =======================================================
     CREATE PRODUCT
  ======================================================= */

  if (intent === "create") {
    const title = String(formData.get("title") || "");

    const description = String(formData.get("description") || "");

    const handle = String(formData.get("handle") || "");

    const productType = String(formData.get("productType") || "");

    const vendor = String(formData.get("vendor") || "");

    const tagsString = String(formData.get("tags") || "");

    const status = String(formData.get("status") || "DRAFT");

    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await admin.graphql(
      `#graphql
          mutation CreateProduct(
            $input: ProductInput!
          ) {
            productCreate(
              input: $input
            ) {
              product {
                id
                title
                description
                handle
                productType
                vendor
                tags
                status
                createdAt
              }

              userErrors {
                field
                message
              }
            }
          }
        `,
      {
        variables: {
          input: {
            title,
            description,
            handle: handle || undefined,
            productType,
            vendor,
            tags,
            status,
          },
        },
      },
    );

    const data = await response.json();

    return {
      type: "create",
      result: data.data.productCreate,
    };
  }

  /* =======================================================
     UPDATE PRODUCT
  ======================================================= */

  if (intent === "update") {
    const id = String(formData.get("id") || "");

    const title = String(formData.get("title") || "");

    const description = String(formData.get("description") || "");

    const handle = String(formData.get("handle") || "");

    const productType = String(formData.get("productType") || "");

    const vendor = String(formData.get("vendor") || "");

    const tagsString = String(formData.get("tags") || "");

    const status = String(formData.get("status") || "DRAFT");

    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await admin.graphql(
      `#graphql
          mutation UpdateProduct(
            $input: ProductInput!
          ) {
            productUpdate(
              input: $input
            ) {
              product {
                id
                title
                description
                handle
                productType
                vendor
                tags
                status
                updatedAt
              }

              userErrors {
                field
                message
              }
            }
          }
        `,
      {
        variables: {
          input: {
            id,
            title,
            description,
            handle: handle || undefined,
            productType,
            vendor,
            tags,
            status,
          },
        },
      },
    );

    const data = await response.json();

    return {
      type: "update",
      result: data.data.productUpdate,
    };
  }

  /* =======================================================
     SINGLE DELETE
  ======================================================= */

  if (intent === "delete") {
    const id = String(formData.get("id") || "");

    const response = await admin.graphql(
      `#graphql
          mutation DeleteProduct(
            $input: ProductDeleteInput!
          ) {
            productDelete(
              input: $input
            ) {
              deletedProductId

              userErrors {
                field
                message
              }
            }
          }
        `,
      {
        variables: {
          input: {
            id,
          },
        },
      },
    );

    const data = await response.json();

    return {
      type: "delete",
      result: data.data.productDelete,
    };
  }

  /* =======================================================
     BULK DELETE
  ======================================================= */

  if (intent === "bulk-delete") {
    const ids = formData.getAll("ids").map(String).filter(Boolean);

    if (ids.length === 0) {
      return {
        type: "bulk-delete",
        success: false,
        message: "No products selected.",
      };
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const response = await admin.graphql(
          `#graphql
                mutation DeleteProduct(
                  $input: ProductDeleteInput!
                ) {
                  productDelete(
                    input: $input
                  ) {
                    deletedProductId

                    userErrors {
                      field
                      message
                    }
                  }
                }
              `,
          {
            variables: {
              input: {
                id,
              },
            },
          },
        );

        return response.json();
      }),
    );

    return {
      type: "bulk-delete",
      success: true,
      message: `${ids.length} products deleted successfully.`,
      results,
    };
  }

  /* =======================================================
     BULK STATUS UPDATE
  ======================================================= */

  if (intent === "bulk-status") {
    const ids = formData.getAll("ids").map(String).filter(Boolean);

    const status = String(formData.get("status") || "DRAFT");

    if (ids.length === 0) {
      return {
        type: "bulk-status",
        success: false,
        message: "No products selected.",
      };
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        const response = await admin.graphql(
          `#graphql
                mutation UpdateProductStatus(
                  $input: ProductInput!
                ) {
                  productUpdate(
                    input: $input
                  ) {
                    product {
                      id
                      title
                      status
                    }

                    userErrors {
                      field
                      message
                    }
                  }
                }
              `,
          {
            variables: {
              input: {
                id,
                status,
              },
            },
          },
        );

        return response.json();
      }),
    );

    return {
      type: "bulk-status",
      success: true,
      message: `${ids.length} products updated successfully.`,
      results,
    };
  }

  return null;
}

/* =========================================================
   MAIN PRODUCT PAGE
========================================================= */

export default function ProductPage() {
  const { products, pageInfo, searchQuery } = useLoaderData<typeof loader>();

  const navigation = useNavigation();

  /* =======================================================
     SEARCH
  ======================================================= */

  const [searchValue, setSearchValue] = useState(searchQuery);

  /* =======================================================
     MODALS
  ======================================================= */

  const [createModal, setCreateModal] = useState(false);

  const [editModal, setEditModal] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);

  /* =======================================================
     SELECTED PRODUCT
  ======================================================= */

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* =======================================================
     BULK SELECTION
  ======================================================= */

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  /* =======================================================
     BULK STATUS
  ======================================================= */

  const [bulkStatus, setBulkStatus] = useState("ACTIVE");

  /* =======================================================
     LOADING
  ======================================================= */

  const isSubmitting = navigation.state === "submitting";

  /* =======================================================
     SELECT ALL
  ======================================================= */

  const allSelected =
    products.length > 0 &&
    products.every((product) => selectedProducts.includes(product.id));

  /* =======================================================
     SELECT ALL HANDLER
  ======================================================= */

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  /* =======================================================
     SELECT SINGLE PRODUCT
  ======================================================= */

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((previous) =>
      checked
        ? [...previous, productId]
        : previous.filter((id) => id !== productId),
    );
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModal(true);
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModal(true);
  };

  /* =======================================================
     CLOSE EDIT
  ======================================================= */

  const closeEdit = () => {
    setEditModal(false);
    setSelectedProduct(null);
  };

  /* =======================================================
     CLOSE DELETE
  ======================================================= */

  const closeDelete = () => {
    setDeleteModal(false);
    setSelectedProduct(null);
  };

  /* =======================================================
     CLEAR SELECTION
  ======================================================= */

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <Page
      title="Products"
      subtitle="Manage your store products"
      primaryAction={{
        content: "Create product",
        onAction: () => setCreateModal(true),
      }}
    >
      <BlockStack gap="500">
        {/* =================================================
            HERO
        ================================================= */}

        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="200">
              <Text as="h2" variant="headingLg">
                Product catalog
              </Text>

              <Text as="p" tone="subdued">
                Create, update and manage all of your products from one place.
              </Text>
            </BlockStack>

            <Box
              padding="300"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text as="p" variant="headingMd">
                {products.length}
              </Text>

              <Text as="p" variant="bodySm" tone="subdued">
                Products on this page
              </Text>
            </Box>
          </InlineStack>
        </Card>

        {/* =================================================
            PRODUCT TABLE
        ================================================= */}

        <Card padding="0">
          {products.length === 0 ? (
            <Box padding="800">
              <EmptyState
                heading="Create your first product"
                action={{
                  content: "Create product",

                  onAction: () => setCreateModal(true),
                }}
                image=""
              >
                <p>
                  Add your first product to start building your store catalog.
                </p>
              </EmptyState>
            </Box>
          ) : (
            <BlockStack gap="0">
              {/* =================================================
                  TABLE TOP
              ================================================= */}

              <Box padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingMd">
                        All products
                      </Text>

                      <Text as="p" tone="subdued">
                        {products.length} products
                        {searchQuery
                          ? ` matching "${searchQuery}"`
                          : " in your catalog"}
                      </Text>
                    </BlockStack>

                    <Button onClick={() => setCreateModal(true)}>
                      Add product
                    </Button>
                  </InlineStack>

                  {/* =================================================
                      SEARCH
                  ================================================= */}

                  <Form method="get">
                    <TextField
                      label="Search products"
                      labelHidden
                      placeholder="Search by title, vendor, or product type"
                      value={searchValue}
                      onChange={setSearchValue}
                      name="query"
                      autoComplete="off"
                      clearButton
                      onClearButtonClick={() => setSearchValue("")}
                    />
                  </Form>
                </BlockStack>
              </Box>

              <Divider />

              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "50px minmax(280px, 2fr) 1fr 1fr 120px 130px",
                  gap: "20px",
                  padding: "12px 24px",
                  background: "#f6f6f7",
                  alignItems: "center",
                }}
              >
                {/* SELECT ALL */}

                <Checkbox
                  label="Select all products"
                  labelHidden
                  checked={allSelected}
                  onChange={handleSelectAll}
                />

                {/* PRODUCT */}

                <Text as="span" variant="bodySm" fontWeight="semibold">
                  Product
                </Text>

                {/* TYPE */}

                <Text as="span" variant="bodySm" fontWeight="semibold">
                  Product type
                </Text>

                {/* VENDOR */}

                <Text as="span" variant="bodySm" fontWeight="semibold">
                  Vendor
                </Text>

                {/* STATUS */}

                <Text as="span" variant="bodySm" fontWeight="semibold">
                  Status
                </Text>

                {/* ACTIONS */}

                <Text as="span" variant="bodySm" fontWeight="semibold">
                  Actions
                </Text>
              </div>

              {/* =================================================
                  PRODUCT ROWS
              ================================================= */}

              {products.map((product) => (
                <ProductRow
                  key={product.id}

                  product={product}

                  selected={selectedProducts.includes(product.id)}

                  onSelect={(checked) =>
                    handleSelectProduct(product.id, checked)
                  }

                  onEdit={() => handleEdit(product)}

                  onDelete={() => handleDelete(product)}
                />
              ))}
            </BlockStack>
          )}
        </Card>

        {/* =================================================
            BULK ACTION BAR
        ================================================= */}

        {selectedProducts.length > 0 && (
          <Card>
            <BlockStack gap="400">
              {/* SELECTED COUNT */}

              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {selectedProducts.length} product
                  {selectedProducts.length > 1 ? "s" : ""} selected
                </Text>

                <Button onClick={clearSelection}>Cancel</Button>
              </InlineStack>

              <Divider />

              {/* BULK ACTIONS */}

              <InlineStack gap="300" blockAlign="end">
                {/* STATUS */}

                <Box minWidth="200px">
                  <Select
                    label="Change status"
                    options={[
                      {
                        label: "Active",
                        value: "ACTIVE",
                      },
                      {
                        label: "Draft",
                        value: "DRAFT",
                      },
                      {
                        label: "Archived",
                        value: "ARCHIVED",
                      },
                    ]}
                    value={bulkStatus}
                    onChange={setBulkStatus}
                  />
                </Box>

                {/* UPDATE STATUS */}

                <Button
                  variant="primary"
                  loading={isSubmitting}
                  onClick={() => {
                    const form = document.getElementById(
                      "bulk-status-form",
                    ) as HTMLFormElement | null;

                    form?.requestSubmit();
                  }}
                >
                  Update status
                </Button>

                {/* DELETE */}

                <Button
                  tone="critical"
                  loading={isSubmitting}
                  onClick={() => {
                    const form = document.getElementById(
                      "bulk-delete-form",
                    ) as HTMLFormElement | null;

                    form?.requestSubmit();
                  }}
                >
                  Delete selected
                </Button>
              </InlineStack>
            </BlockStack>

            {/* =================================================
                BULK STATUS FORM
            ================================================= */}

            <Form id="bulk-status-form" method="post">
              <input type="hidden" name="intent" value="bulk-status" />

              <input type="hidden" name="status" value={bulkStatus} />

              {selectedProducts.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
            </Form>

            {/* =================================================
                BULK DELETE FORM
            ================================================= */}

            <Form id="bulk-delete-form" method="post">
              <input type="hidden" name="intent" value="bulk-delete" />

              {selectedProducts.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}
            </Form>
          </Card>
        )}

        {/* =================================================
            PAGINATION
        ================================================= */}

        <Card>
  <InlineStack
    align="space-between"
    blockAlign="center"
  >
    <Form method="get">
      <input
        type="hidden"
        name="direction"
        value="previous"
      />

      <input
        type="hidden"
        name="before"
        value={pageInfo.startCursor || ""}
      />

      <input
        type="hidden"
        name="query"
        value={searchQuery}
      />

      <Button
        submit
        disabled={!pageInfo.hasPreviousPage}
      >
        Previous
      </Button>
    </Form>

    <Text as="p" tone="subdued">
      Showing {products.length} products
    </Text>

    <Form method="get">
      <input
        type="hidden"
        name="direction"
        value="next"
      />

      <input
        type="hidden"
        name="after"
        value={pageInfo.endCursor || ""}
      />

      <input
        type="hidden"
        name="query"
        value={searchQuery}
      />

      <Button
        submit
        disabled={!pageInfo.hasNextPage}
      >
        Next
      </Button>
    </Form>
  </InlineStack>
</Card>
      </BlockStack>

      {/* =================================================
          CREATE MODAL
      ================================================= */}

      <CreateProductModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        loading={isSubmitting}
      />

      {/* =================================================
    EDIT MODAL
================================================= */}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          open={editModal}
          onClose={closeEdit}
          loading={isSubmitting}
        />
      )}

      {/* =================================================
    DELETE MODAL
================================================= */}

      {selectedProduct && (
        <DeleteProductModal
          product={selectedProduct}
          open={deleteModal}
          onClose={closeDelete}
          loading={isSubmitting}
        />
      )}
    </Page>
  );
}
