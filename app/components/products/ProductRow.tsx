import {
  Text,
  Badge,
  Thumbnail,
  InlineStack,
  Button,
  Checkbox,
} from "@shopify/polaris";

import { EditIcon, DeleteIcon } from "@shopify/polaris-icons";

import { Link } from "@remix-run/react";

import type { Product } from "../../types/product";

type Props = {
  product: Product;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ProductRow({
  product,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "50px minmax(280px, 2fr) 1fr 1fr 120px 130px",
        gap: "20px",
        padding: "16px 24px",
        alignItems: "center",
        borderBottom: "1px solid #e1e3e5",
      }}
    >
      <Checkbox
        label={`Select ${product.title}`}
        labelHidden
        checked={selected}
        onChange={onSelect}
      />

      {/* PRODUCT */}

      <InlineStack gap="300" blockAlign="center">
        <Thumbnail
          source={
            product.featuredImage?.url ||
            "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          }
          alt={product.featuredImage?.altText || product.title}
          size="small"
        />

        <div>
          <Link to={`/app/product/${product.id}`}>
            <Text
              as="span"
              variant="bodyMd"
              fontWeight="semibold"
            >
              {product.title}
            </Text>
          </Link>

          <Text
            as="p"
            variant="bodySm"
            tone="subdued"
          >
            {product.handle}
          </Text>
        </div>
      </InlineStack>

      {/* PRODUCT TYPE */}

      <Text as="span">
        {product.productType || "-"}
      </Text>

      {/* VENDOR */}

      <Text as="span">
        {product.vendor || "-"}
      </Text>

      {/* STATUS */}

      <Badge
        tone={
          product.status === "ACTIVE"
            ? "success"
            : product.status === "DRAFT"
              ? "info"
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
          onClick={onEdit}
        />

        <Button
          icon={DeleteIcon}
          accessibilityLabel="Delete product"
          tone="critical"
          onClick={onDelete}
        />
      </InlineStack>
    </div>
  );
}