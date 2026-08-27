import {
  InlineStack,
  BlockStack,
  Text,
  Button,
  Badge,
  Thumbnail,
} from "@shopify/polaris";

import {
  EditIcon,
  DeleteIcon,
} from "@shopify/polaris-icons";

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
        padding: "18px 24px",
        borderBottom: "1px solid #e1e3e5",
        alignItems: "center",
      }}
    >
      {/* CHECKBOX */}

      <input
        type="checkbox"
        checked={selected}
        onChange={(e) =>
          onSelect(e.target.checked)
        }
      />

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
            <Link
            to={`/app/products/${encodeURIComponent(product.id)}`}
            >
            {product.title}
            </Link>
            {/* {product.title} */}
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