import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";

import { json } from "@remix-run/node";

import {
  Page,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Badge,
  Thumbnail,
  EmptyState,
  Divider,
  Box,
  Select,
  Checkbox,
} from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import { useState } from "react";

/* ---------------- LOADER ---------------- */

export async function loader({
  request,
}: LoaderFunctionArgs) {
  return json({
    message: "Wishlist loaded successfully!",
    method: request.method,

    wishlistItems: [
      {
        id: "1",
        title: "Wireless Headphones",
        vendor: "Tech Store",
        price: "$129.99",
        image:
          "https://cdn.shopify.com/s/files/1/0262/4071/2726/products/headphones.jpg",
        status: "In stock",
      },
      {
        id: "2",
        title: "Smart Watch",
        vendor: "Digital World",
        price: "$199.99",
        image:
          "https://cdn.shopify.com/s/files/1/0262/4071/2726/products/smart-watch.jpg",
        status: "Low stock",
      },
      {
        id: "3",
        title: "Premium Backpack",
        vendor: "Urban Store",
        price: "$89.99",
        image:
          "https://cdn.shopify.com/s/files/1/0262/4071/2726/products/backpack.jpg",
        status: "In stock",
      },
    ],
  });
}

/* ---------------- ACTION ---------------- */

export async function action({
  request,
}: ActionFunctionArgs) {
  const method = request.method;

  switch (method) {
    case "POST":
      return json({
        message: "Wishlist item added successfully!",
        method: "POST",
      });

    case "PUT":
      return json({
        message: "Wishlist item updated successfully!",
        method: "PUT",
      });

    case "PATCH":
      return json({
        message: "Wishlist item updated successfully!",
        method: "PATCH",
      });

    case "DELETE":
      return json({
        message: "Wishlist item removed successfully!",
        method: "DELETE",
      });

    default:
      return json(
        {
          message: `Unsupported request method: ${method}`,
        },
        {
          status: 405,
        },
      );
  }
}

/* ---------------- COMPONENT ---------------- */

export default function WishlistPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [sortValue, setSortValue] = useState("recent");

  const wishlistItems = [
    {
      id: "1",
      title: "Wireless Headphones",
      vendor: "Tech Store",
      price: "$129.99",
      status: "In stock",
    },
    {
      id: "2",
      title: "Smart Watch",
      vendor: "Digital World",
      price: "$199.99",
      status: "Low stock",
    },
    {
      id: "3",
      title: "Premium Backpack",
      vendor: "Urban Store",
      price: "$89.99",
      status: "In stock",
    },
  ];

  return (
    <Page
      title="Wishlist"
      subtitle="Products saved for later"
      primaryAction={{
        content: "Add product",
        onAction: () => {
          console.log("Add product clicked");
        },
      }}
    >
      <TitleBar title="Wishlist" />

      <BlockStack gap="500">

        {/* SUMMARY CARDS */}
        <InlineStack gap="400" wrap>
          <Card>
            <Box minWidth="180px">
              <BlockStack gap="100">
                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Saved products
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  {wishlistItems.length}
                </Text>
              </BlockStack>
            </Box>
          </Card>

          <Card>
            <Box minWidth="180px">
              <BlockStack gap="100">
                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  In stock
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  2
                </Text>
              </BlockStack>
            </Box>
          </Card>

          <Card>
            <Box minWidth="180px">
              <BlockStack gap="100">
                <Text
                  as="p"
                  variant="bodySm"
                  tone="subdued"
                >
                  Low stock
                </Text>

                <Text
                  as="h2"
                  variant="heading2xl"
                >
                  1
                </Text>
              </BlockStack>
            </Box>
          </Card>
        </InlineStack>

        {/* WISHLIST */}
        <Card>
          <BlockStack gap="400">

            <InlineStack
              align="space-between"
              blockAlign="center"
            >
              <BlockStack gap="100">
                <Text
                  as="h2"
                  variant="headingMd"
                >
                  Saved products
                </Text>

                <Text
                  as="p"
                  variant="bodyMd"
                  tone="subdued"
                >
                  Manage products you want to keep
                  track of.
                </Text>
              </BlockStack>

              <Select
                label="Sort"
                labelHidden
                options={[
                  {
                    label: "Recently added",
                    value: "recent",
                  },
                  {
                    label: "Price: Low to high",
                    value: "low",
                  },
                  {
                    label: "Price: High to low",
                    value: "high",
                  },
                  {
                    label: "Product name",
                    value: "name",
                  },
                ]}
                value={sortValue}
                onChange={setSortValue}
              />
            </InlineStack>

            <Divider />

            {/* PRODUCT LIST */}
            <BlockStack gap="0">
              {wishlistItems.map((product, index) => (
                <Box
                  key={product.id}
                  paddingBlock="400"
                >
                  <InlineStack
                    align="space-between"
                    blockAlign="center"
                    gap="400"
                    wrap={false}
                  >

                    <InlineStack
                      gap="400"
                      blockAlign="center"
                    >
                      <Checkbox
                        label=""
                        checked={selected.includes(
                          product.id,
                        )}
                        onChange={(checked) => {
                          setSelected((prev) =>
                            checked
                              ? [
                                  ...prev,
                                  product.id,
                                ]
                              : prev.filter(
                                  (id) =>
                                    id !== product.id,
                                ),
                          );
                        }}
                      />

                      <Thumbnail
                        source=""
                        alt={product.title}
                        size="medium"
                      />

                      <BlockStack gap="100">
                        <Text
                          as="h3"
                          variant="headingSm"
                        >
                          {product.title}
                        </Text>

                        <Text
                          as="p"
                          variant="bodySm"
                          tone="subdued"
                        >
                          {product.vendor}
                        </Text>

                        <InlineStack gap="200">
                          <Text
                            as="span"
                            variant="bodyMd"
                            fontWeight="semibold"
                          >
                            {product.price}
                          </Text>

                          <Badge
                            tone={
                              product.status ===
                              "In stock"
                                ? "success"
                                : "warning"
                            }
                          >
                            {product.status}
                          </Badge>
                        </InlineStack>
                      </BlockStack>
                    </InlineStack>

                    <InlineStack gap="200">
                      <Button>
                        View
                      </Button>

                      <Button
                        tone="critical"
                        variant="tertiary"
                      >
                        Remove
                      </Button>
                    </InlineStack>

                  </InlineStack>

                  {index <
                    wishlistItems.length - 1 && (
                    <Box paddingBlockStart="400">
                      <Divider />
                    </Box>
                  )}
                </Box>
              ))}
            </BlockStack>

          </BlockStack>
        </Card>

        {/* BULK ACTION */}
        {selected.length > 0 && (
          <Card>
            <InlineStack
              align="space-between"
              blockAlign="center"
            >
              <Text
                as="p"
                variant="bodyMd"
              >
                {selected.length} product
                {selected.length > 1 ? "s" : ""}{" "}
                selected
              </Text>

              <InlineStack gap="200">
                <Button
                  onClick={() =>
                    setSelected([])
                  }
                >
                  Cancel
                </Button>

                <Button tone="critical">
                  Remove selected
                </Button>
              </InlineStack>
            </InlineStack>
          </Card>
        )}

        {/* EMPTY STATE EXAMPLE */}
        {wishlistItems.length === 0 && (
          <Card>
            <EmptyState
              heading="Your wishlist is empty"
              action={{
                content: "Browse products",
                onAction: () => {
                  console.log(
                    "Browse products clicked",
                  );
                },
              }}
              image="https://cdn.shopify.com/static/images/admin/empty-state.svg"
            >
              <p>
                Save products to your wishlist to
                easily find them later.
              </p>
            </EmptyState>
          </Card>
        )}

      </BlockStack>
    </Page>
  );
}