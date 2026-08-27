
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

import { authenticate } from "../shopify.server";


export default function CreateProductModal({
  open,
  onClose,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  loading: boolean;
}) {
  const [formValues, setFormValues] = useState<ProductFormValues>({
    title: "",
    description: "",
    handle: "",
    productType: "",
    vendor: "",
    tags: "",
    status: "DRAFT",
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
        <Form id="create-product-form" method="post" onSubmit={onClose}>
          <input type="hidden" name="intent" value="create" />

          <BlockStack gap="500">
            {/* HEADER */}

            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">
                Product information
              </Text>

              <Text as="p" tone="subdued">
                Add the basic information for your new product.
              </Text>
            </BlockStack>

            <Divider />

            {/* TITLE */}

            <TextField
              label="Product title"
              placeholder="e.g. Classic Blue T-Shirt"
              value={formValues.title}
              onChange={(value) => updateField("title", value)}
              name="title"
              autoComplete="off"
              requiredIndicator
            />

            {/* DESCRIPTION */}

            <TextField
              label="Description"
              placeholder="Describe your product..."
              value={formValues.description}
              onChange={(value) => updateField("description", value)}
              name="description"
              multiline={5}
              autoComplete="off"
            />

            {/* HANDLE */}

            <TextField
              label="Handle"
              placeholder="classic-blue-t-shirt"
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
                  placeholder="e.g. T-Shirt"
                  value={formValues.productType}
                  onChange={(value) => updateField("productType", value)}
                  name="productType"
                  autoComplete="off"
                />
              </Box>

              <Box width="50%">
                <TextField
                  label="Vendor"
                  placeholder="e.g. Nike"
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
              placeholder="summer, blue, t-shirt"
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