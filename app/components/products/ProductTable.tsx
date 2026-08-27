import {
  BlockStack,
  Divider,
  Text,
  Box,
  EmptyState,
} from "@shopify/polaris";

import ProductRow from "./ProductRow";

import type { Product } from "../../types/product";

type Props = {
  products: Product[];
  selectedProducts: string[];
  onSelect: (
    id: string,
    checked: boolean,
  ) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export default function ProductTable({
  products,
  selectedProducts,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  if (products.length === 0) {
    return (
      <Box padding="800">
        <EmptyState
          heading="No products found"
          image=""
        >
          <p>
            Try another search or create a new
            product.
          </p>
        </EmptyState>
      </Box>
    );
  }

  return (
    <BlockStack gap="0">
      {/* HEADER */}

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
        <Text
          as="span"
          variant="bodySm"
          fontWeight="semibold"
        >
          Select
        </Text>

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

      <Divider />

      {/* ROWS */}

      {products.map((product) => (
        <ProductRow
          key={product.id}
          product={product}
          selected={selectedProducts.includes(
            product.id,
          )}
          onSelect={(checked) =>
            onSelect(product.id, checked)
          }
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
        />
      ))}
    </BlockStack>
  );
}