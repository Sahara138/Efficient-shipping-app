import {
  Modal,
  BlockStack,
  Text,
  Box,
} from "@shopify/polaris";

import { Form } from "@remix-run/react";

import type { Product } from "../../types/product";

type DeleteProductModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
  loading: boolean;
};

export default function DeleteProductModal({
  product,
  open,
  onClose,
  loading,
}: DeleteProductModalProps) {
  const handleDelete = () => {
    const form = document.getElementById(
      "delete-product-form",
    ) as HTMLFormElement | null;

    form?.requestSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete product"
      primaryAction={{
        content: "Delete product",
        destructive: true,
        loading,
        onAction: handleDelete,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          {/* MESSAGE */}

          <Text as="p" variant="bodyMd">
            Are you sure you want to delete{" "}
            <strong>{product.title}</strong>?
          </Text>

          {/* WARNING */}

          <Box
            padding="400"
            background="bg-surface-secondary"
            borderRadius="200"
          >
            <Text as="p" tone="subdued">
              This action cannot be undone. The
              product will be permanently removed
              from your store.
            </Text>
          </Box>

          {/* DELETE FORM */}

          <Form
            id="delete-product-form"
            method="post"
            onSubmit={onClose}
          >
            <input
              type="hidden"
              name="intent"
              value="delete"
            />

            <input
              type="hidden"
              name="id"
              value={product.id}
            />
          </Form>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}