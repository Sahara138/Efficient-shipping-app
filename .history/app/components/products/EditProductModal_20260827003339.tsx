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
  Checkbox,
} from "@shopify/polaris";

import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";

import { useState } from "react";


export default function EditProductModal({
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
  const [formValues, setFormValues] = useState<ProductFormValues>({
    title: product.title || "",
    description: product.description || "",
    handle: product.handle || "",
    productType: product.productType || "",
    vendor: product.vendor || "",
    tags: product.tags?.join(", ") || "",
    status: product.status || "DRAFT",
  });

  const updateField = (field: keyof ProductFormValues, value: string) => {
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
        <Form id="edit-product-form" method="post" onSubmit={onClose}>
          <input type="hidden" name="intent" value="update" />

          <input type="hidden" name="id" value={product.id} />

          <BlockStack gap="500">
            {/* HEADER */}

            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">
                Product information
              </Text>

              <Text as="p" tone="subdued">
                Update your product information below.
              </Text>
            </BlockStack>

            <Divider />

            {/* TITLE */}

            <TextField
              label="Product title"
              value={formValues.title}
              onChange={(value) => updateField("title", value)}
              name="title"
              autoComplete="off"
              requiredIndicator
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              value={formValues.description}
              onChange={(value) => updateField("description", value)}
              name="description"
              multiline={5}
              autoComplete="off"
            />

            {/* HANDLE */}

            <TextField
              label="Handle"
              value={formValues.handle}
              onChange={(value) => updateField("handle", value)}
              name="handle"
              autoComplete="off"
              helpText="Used in the product URL."
            />

            {/* TYPE + VENDOR */}

            <InlineStack gap="400" wrap={false}>
              <Box width="50%">
                <TextField
                  label="Product type"
                  value={formValues.productType}
                  onChange={(value) => updateField("productType", value)}
                  name="productType"
                  autoComplete="off"
                />
              </Box>

              <Box width="50%">
                <TextField
                  label="Vendor"
                  value={formValues.vendor}
                  onChange={(value) => updateField("vendor", value)}
                  name="vendor"
                  autoComplete="off"
                />
              </Box>
            </InlineStack>

            {/* TAGS */}

            <TextField
              label="Tags"
              value={formValues.tags}
              onChange={(value) => updateField("tags", value)}
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
              onChange={(value) => updateField("status", value)}
            />

            <input type="hidden" name="status" value={formValues.status} />

            <Box
              padding="400"
              background="bg-surface-secondary"
              borderRadius="200"
            >
              <Text as="p" tone="subdued">
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