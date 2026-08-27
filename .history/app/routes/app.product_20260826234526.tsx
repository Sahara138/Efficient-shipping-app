import {
  Page,
  Card,
  Text,
  TextField,
  Button,
  Modal,
  BlockStack,
  InlineStack,
  Select,
  Badge,
  Divider,
  EmptyState,
  Thumbnail,
  Box,
  Icon,
} from "@shopify/polaris";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";

import {
  EditIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";

import { useState } from "react";

import { authenticate } from "../shopify.server";


/* =========================================================
   TYPES
========================================================= */

type Product = {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
};

type ProductFormValues = {
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string;
  status: string;
};

/* =========================================================
   LOADER
========================================================= */

export async function loader({
  request,
}: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const searchQuery =
    url.searchParams.get("query") || "";

  const response = await admin.graphql(
    `#graphql
      query GetProducts() {
        products(first: 50, sortKey: CREATED_AT, reverse: true) {
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
        }
      }
    `,
  );

  const data = await response.json();

  return {
    products: data.data.products.nodes as Product[],
  };
}

/* =========================================================
   ACTION
========================================================= */

export async function action({
  request,
}: ActionFunctionArgs) {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();

  const intent = formData.get("intent");

  /* =====================================================
     CREATE
  ===================================================== */

  if (intent === "create") {
    const title = String(formData.get("title") || "");
    const description = String(
      formData.get("description") || "",
    );
    const handle = String(formData.get("handle") || "");
    const productType = String(
      formData.get("productType") || "",
    );
    const vendor = String(formData.get("vendor") || "");
    const tagsString = String(formData.get("tags") || "");
    const status = String(
      formData.get("status") || "DRAFT",
    );

    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await admin.graphql(
      `#graphql
        mutation CreateProduct($input: ProductInput!) {
          productCreate(input: $input) {
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

  /* =====================================================
     UPDATE
  ===================================================== */

  if (intent === "update") {
    const id = String(formData.get("id") || "");

    const title = String(formData.get("title") || "");
    const description = String(
      formData.get("description") || "",
    );
    const handle = String(formData.get("handle") || "");
    const productType = String(
      formData.get("productType") || "",
    );
    const vendor = String(formData.get("vendor") || "");
    const tagsString = String(formData.get("tags") || "");
    const status = String(
      formData.get("status") || "DRAFT",
    );

    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await admin.graphql(
      `#graphql
        mutation UpdateProduct($input: ProductInput!) {
          productUpdate(input: $input) {
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

  /* =====================================================
     DELETE
  ===================================================== */

  if (intent === "delete") {
    const id = String(formData.get("id") || "");

    const response = await admin.graphql(
      `#graphql
        mutation DeleteProduct($input: ProductDeleteInput!) {
          productDelete(input: $input) {
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

  return null;
}

/* =========================================================
   CREATE PRODUCT MODAL
========================================================= */

function CreateProductModal({
  open,
  onClose,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
}) {
  const [formValues, setFormValues] =
    useState<ProductFormValues>({
      title: "",
      description: "",
      handle: "",
      productType: "",
      vendor: "",
      tags: "",
      status: "DRAFT",
    });

  const updateField = (
    field: keyof ProductFormValues,
    value: string,
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create product"
      size="large"
      primaryAction={{
        content: "Create product",
        loading,
        onAction: () => {
          const form = document.getElementById(
            "create-product-form",
          ) as HTMLFormElement | null;

          form?.requestSubmit();
        },
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Form
          id="create-product-form"
          method="post"
          onSubmit={onClose}
        >
          <input
            type="hidden"
            name="intent"
            value="create"
          />

          <BlockStack gap="500">
            {/* HEADER */}

            <BlockStack gap="100">
              <Text
                as="h2"
                variant="headingLg"
              >
                Product information
              </Text>

              <Text
                as="p"
                tone="subdued"
              >
                Add the basic information for your new
                product.
              </Text>
            </BlockStack>

            <Divider />

            {/* TITLE */}

            <TextField
              label="Product title"
              placeholder="e.g. Classic Blue T-Shirt"
              value={formValues.title}
              onChange={(value) =>
                updateField("title", value)
              }
              name="title"
              autoComplete="off"
              requiredIndicator
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              placeholder="Describe your product..."
              value={formValues.description}
              onChange={(value) =>
                updateField("description", value)
              }
              name="description"
              multiline={5}
              autoComplete="off"
            />

            {/* HANDLE */}

            <TextField
              label="Handle"
              placeholder="classic-blue-t-shirt"
              value={formValues.handle}
              onChange={(value) =>
                updateField("handle", value)
              }
              name="handle"
              autoComplete="off"
              helpText="Used in the product URL."
            />

            {/* TYPE + VENDOR */}

            <InlineStack
              gap="400"
              wrap={false}
            >
              <Box width="50%">
                <TextField
                  label="Product type"
                  placeholder="e.g. T-Shirt"
                  value={formValues.productType}
                  onChange={(value) =>
                    updateField(
                      "productType",
                      value,
                    )
                  }
                  name="productType"
                  autoComplete="off"
                />
              </Box>

              <Box width="50%">
                <TextField
                  label="Vendor"
                  placeholder="e.g. Nike"
                  value={formValues.vendor}
                  onChange={(value) =>
                    updateField(
                      "vendor",
                      value,
                    )
                  }
                  name="vendor"
                  autoComplete="off"
                />
              </Box>
            </InlineStack>

            {/* TAGS */}

            <TextField
              label="Tags"
              placeholder="summer, blue, t-shirt"
              value={formValues.tags}
              onChange={(value) =>
                updateField("tags", value)
              }
              name="tags"
              autoComplete="off"
              helpText="Separate multiple tags with commas."
            />

            {/* STATUS */}

            <Select
              label="Status"
              options={[
                {
                  label: "Active",
                  value: "ACTIVE",
                },
                {
                  label: "Draft",
                  value: "DRAFT",
                },
              ]}
              value={formValues.status}
              onChange={(value) =>
                updateField("status", value)
              }
            />

            <input
              type="hidden"
              name="status"
              value={formValues.status}
            />

            <Box
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text
                as="p"
                tone="subdued"
              >
                {formValues.status === "ACTIVE"
                  ? "This product will be visible and available in your store."
                  : "This product will be saved as a draft and won't be published."}
              </Text>
            </Box>
          </BlockStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

/* =========================================================
   EDIT PRODUCT MODAL
========================================================= */

function EditProductModal({
  product,
  open,
  onClose,
  loading,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  loading: boolean;
}) {
  const [formValues, setFormValues] =
    useState<ProductFormValues>({
      title: product.title || "",
      description: product.description || "",
      handle: product.handle || "",
      productType: product.productType || "",
      vendor: product.vendor || "",
      tags: product.tags?.join(", ") || "",
      status: product.status || "DRAFT",
    });

  const updateField = (
    field: keyof ProductFormValues,
    value: string,
  ) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit product"
      size="large"
      primaryAction={{
        content: "Save changes",
        loading,
        onAction: () => {
          const form = document.getElementById(
            "edit-product-form",
          ) as HTMLFormElement | null;

          form?.requestSubmit();
        },
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <Form
          id="edit-product-form"
          method="post"
          onSubmit={onClose}
        >
          <input
            type="hidden"
            name="intent"
            value="update"
          />

          <input
            type="hidden"
            name="id"
            value={product.id}
          />

          <BlockStack gap="500">
            {/* HEADER */}

            <BlockStack gap="100">
              <Text
                as="h2"
                variant="headingLg"
              >
                Product information
              </Text>

              <Text
                as="p"
                tone="subdued"
              >
                Update your product information below.
              </Text>
            </BlockStack>

            <Divider />

            {/* TITLE */}

            <TextField
              label="Product title"
              value={formValues.title}
              onChange={(value) =>
                updateField("title", value)
              }
              name="title"
              autoComplete="off"
              requiredIndicator
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              value={formValues.description}
              onChange={(value) =>
                updateField(
                  "description",
                  value,
                )
              }
              name="description"
              multiline={5}
              autoComplete="off"
            />

            {/* HANDLE */}

            <TextField
              label="Handle"
              value={formValues.handle}
              onChange={(value) =>
                updateField(
                  "handle",
                  value,
                )
              }
              name="handle"
              autoComplete="off"
              helpText="Used in the product URL."
            />

            {/* TYPE + VENDOR */}

            <InlineStack
              gap="400"
              wrap={false}
            >
              <Box width="50%">
                <TextField
                  label="Product type"
                  value={formValues.productType}
                  onChange={(value) =>
                    updateField(
                      "productType",
                      value,
                    )
                  }
                  name="productType"
                  autoComplete="off"
                />
              </Box>

              <Box width="50%">
                <TextField
                  label="Vendor"
                  value={formValues.vendor}
                  onChange={(value) =>
                    updateField(
                      "vendor",
                      value,
                    )
                  }
                  name="vendor"
                  autoComplete="off"
                />
              </Box>
            </InlineStack>

            {/* TAGS */}

            <TextField
              label="Tags"
              value={formValues.tags}
              onChange={(value) =>
                updateField("tags", value)
              }
              name="tags"
              autoComplete="off"
              helpText="Separate multiple tags with commas."
            />

            {/* STATUS */}

            <Select
              label="Status"
              options={[
                {
                  label: "Active",
                  value: "ACTIVE",
                },
                {
                  label: "Draft",
                  value: "DRAFT",
                },
              ]}
              value={formValues.status}
              onChange={(value) =>
                updateField("status", value)
              }
            />

            <input
              type="hidden"
              name="status"
              value={formValues.status}
            />

            <Box
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text
                as="p"
                tone="subdued"
              >
                {formValues.status === "ACTIVE"
                  ? "This product is active."
                  : "This product is currently a draft."}
              </Text>
            </Box>
          </BlockStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
}

/* =========================================================
   PRODUCT ROW
========================================================= */

function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(280px, 2fr) 1fr 1fr 120px 130px",
        gap: "20px",
        padding: "18px 24px",
        borderBottom: "1px solid #e1e3e5",
        alignItems: "center",
        transition: "background 0.15s ease",
      }}
    >
      {/* PRODUCT */}

      <InlineStack
        gap="300"
        blockAlign="center"
        wrap={false}
      >
        <Thumbnail
          source={
            product.featuredImage?.url ||
            "https://cdn.shopify.com/static/no-image.svg"
          }
          alt={product.title}
          size="medium"
        />

        <BlockStack gap="100">
          <Button
            variant="plain"
            onClick={onEdit}
          >
            {product.title}
          </Button>

          <Text
            as="p"
            variant="bodySm"
            tone="subdued"
          >
            /products/{product.handle}
          </Text>
        </BlockStack>
      </InlineStack>

      {/* TYPE */}

      <Text as="span">
        {product.productType || "—"}
      </Text>

      {/* VENDOR */}

      <Text as="span">
        {product.vendor || "—"}
      </Text>

      {/* STATUS */}

      <Badge
        tone={
          product.status === "ACTIVE"
            ? "success"
            : "attention"
        }
      >
        {product.status}
      </Badge>

      {/* ACTIONS */}

      <InlineStack gap="200">
        <Button
          icon={EditIcon}
          accessibilityLabel="Edit product"
          variant="tertiary"
          onClick={onEdit}
        />

        <Button
          icon={DeleteIcon}
          accessibilityLabel="Delete product"
          variant="tertiary"
          tone="critical"
          onClick={onDelete}
        />
      </InlineStack>
    </div>
  );
}

/* =========================================================
   MAIN PRODUCT PAGE
========================================================= */

export default function ProductPage() {
  const { products } =
    useLoaderData<typeof loader>();

  const navigation = useNavigation();

  const [createModal, setCreateModal] =
    useState(false);

  const [editModal, setEditModal] =
    useState(false);

  const [deleteModal, setDeleteModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const isSubmitting =
    navigation.state === "submitting";

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModal(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModal(true);
  };

  const closeEdit = () => {
    setEditModal(false);
    setSelectedProduct(null);
  };

  const closeDelete = () => {
    setDeleteModal(false);
    setSelectedProduct(null);
  };

  return (
    <Page
      title="Products"
      subtitle="Manage your store products"
      primaryAction={{
        content: "Create product",
        onAction: () =>
          setCreateModal(true),
      }}
    >
      <BlockStack gap="500">

        {/* =================================================
            HERO / INTRO
        ================================================= */}

        <Card>
          <InlineStack
            align="space-between"
            blockAlign="center"
          >
            <BlockStack gap="200">
              <Text
                as="h2"
                variant="headingLg"
              >
                Product catalog
              </Text>

              <Text
                as="p"
                tone="subdued"
              >
                Create, update and manage all of your
                products from one place.
              </Text>
            </BlockStack>

            <Box
              padding="300"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text
                as="p"
                variant="headingMd"
              >
                {products.length}
              </Text>

              <Text
                as="p"
                variant="bodySm"
                tone="subdued"
              >
                Total products
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
                  onAction: () =>
                    setCreateModal(true),
                }}
                image=""
              >
                <p>
                  Add your first product to start
                  building your store catalog.
                </p>
              </EmptyState>
            </Box>
          ) : (
            <BlockStack gap="0">

              {/* TABLE TOP */}

              <Box padding="400">
                <InlineStack
                  align="space-between"
                  blockAlign="center"
                >
                  <BlockStack gap="100">
                    <Text
                      as="h2"
                      variant="headingMd"
                    >
                      All products
                    </Text>

                    <Text
                      as="p"
                      tone="subdued"
                    >
                      {products.length} products
                      in your catalog
                    </Text>
                  </BlockStack>

                  <Button
                    onClick={() =>
                      setCreateModal(true)
                    }
                  >
                    Add product
                  </Button>
                </InlineStack>
              </Box>

              <Divider />

              {/* TABLE HEADER */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(280px, 2fr) 1fr 1fr 120px 130px",
                  gap: "20px",
                  padding:
                    "12px 24px",
                  background:
                    "#f6f6f7",
                  alignItems:
                    "center",
                }}
              >
                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  Product
                </Text>

                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  Product type
                </Text>

                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  Vendor
                </Text>

                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  Status
                </Text>

                <Text
                  as="span"
                  variant="bodySm"
                  fontWeight="semibold"
                >
                  Actions
                </Text>
              </div>

              {/* PRODUCTS */}

              {products.map(
                (product: any) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() =>
                      handleEdit(product)
                    }
                    onDelete={() =>
                      handleDelete(product)
                    }
                  />
                ),
              )}
            </BlockStack>
          )}
        </Card>
      </BlockStack>

      {/* =================================================
          CREATE MODAL
      ================================================= */}

      <CreateProductModal
        open={createModal}
        onClose={() =>
          setCreateModal(false)
        }
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
        <Modal
          open={deleteModal}
          onClose={closeDelete}
          title="Delete product"
          primaryAction={{
            content: "Delete product",
            destructive: true,
            loading: isSubmitting,
            onAction: () => {
              const form =
                document.getElementById(
                  "delete-product-form",
                ) as HTMLFormElement | null;

              form?.requestSubmit();
            },
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: closeDelete,
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">

              <Text
                as="p"
                variant="bodyMd"
              >
                Are you sure you want to delete{" "}
                <strong>
                  {selectedProduct.title}
                </strong>
                ?
              </Text>

              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <Text
                  as="p"
                  tone="subdued"
                >
                  This action cannot be undone.
                  The product will be permanently
                  removed from your store.
                </Text>
              </Box>

              <Form
                id="delete-product-form"
                method="post"
                onSubmit={closeDelete}
              >
                <input
                  type="hidden"
                  name="intent"
                  value="delete"
                />

                <input
                  type="hidden"
                  name="id"
                  value={selectedProduct.id}
                />
              </Form>

            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}