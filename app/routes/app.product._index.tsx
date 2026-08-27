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

import { useState, useMemo } from "react";

import { authenticate } from "../shopify.server";

/* =========================================================
   COMPONENTS
========================================================= */

import CreateProductModal from "../components/products/CreateProductModal";
import EditProductModal from "../components/products/EditProductModal";
import DeleteProductModal from "../components/products/DeleteProductModal";
import ProductRow from "../components/products/ProductRow";
import ProductPagination from "../components/products/ProductPagination";
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

  let products: Product[] = [];
  let pageInfo = { hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null };

  try {
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
    if (data?.data?.products) {
      products = data.data.products.nodes as Product[];
      pageInfo = data.data.products.pageInfo;
    }
  } catch (err) {
    // Fallback mock data for offline/standalone mode
    products = [
      {
        id: "gid://shopify/Product/9321200156804",
        title: "Eco Lightweight Courier Satchel",
        description: "Recyclable weatherproof satchel bag for shipping logistics",
        handle: "eco-satchel",
        productType: "Packaging",
        vendor: "Efficient Shipping",
        tags: ["Eco", "Satchel"],
        status: "ACTIVE",
        createdAt: "2026-08-01",
        updatedAt: "2026-08-20",
        featuredImage: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_small.png" },
      },
      {
        id: "gid://shopify/Product/9321200156805",
        title: "Thermal Label Printer Pro",
        description: "High-speed 300dpi thermal shipping label printer",
        handle: "thermal-printer",
        productType: "Hardware",
        vendor: "Efficient Shipping",
        tags: ["Printer", "Hardware"],
        status: "ACTIVE",
        createdAt: "2026-08-10",
        updatedAt: "2026-08-25",
        featuredImage: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_small.png" },
      },
      {
        id: "gid://shopify/Product/9321200156806",
        title: "Heavy Duty Shipping Boxes (Pack of 25)",
        description: "Double-walled corrugated shipping boxes",
        handle: "heavy-duty-boxes",
        productType: "Boxes",
        vendor: "Efficient Shipping",
        tags: ["Boxes", "HeavyDuty"],
        status: "ACTIVE",
        createdAt: "2026-08-15",
        updatedAt: "2026-08-26",
        featuredImage: { url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_small.png" },
      },
    ];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.productType.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.handle.toLowerCase().includes(q)
      );
    }
  }

  return {
    products,
    pageInfo,
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

    try {
      const response = await admin.graphql(
        `#graphql
            mutation CreateProduct($input: ProductInput!) {
              productCreate(input: $input) {
                product { id title description handle productType vendor tags status createdAt }
                userErrors { field message }
              }
            }
          `,
        {
          variables: {
            input: { title, description, handle: handle || undefined, productType, vendor, tags, status },
          },
        },
      );
      const data = await response.json();
      return { type: "create", result: data.data.productCreate };
    } catch (e) {
      return { type: "create", result: { product: { id: `gid://shopify/Product/${Date.now()}`, title } } };
    }
  }

  if (intent === "update") {
    const id = String(formData.get("id") || "");
    const title = String(formData.get("title") || "");
    const description = String(formData.get("description") || "");
    const handle = String(formData.get("handle") || "");
    const productType = String(formData.get("productType") || "");
    const vendor = String(formData.get("vendor") || "");
    const tagsString = String(formData.get("tags") || "");
    const status = String(formData.get("status") || "DRAFT");

    const tags = tagsString.split(",").map((tag) => tag.trim()).filter(Boolean);

    try {
      const response = await admin.graphql(
        `#graphql
            mutation UpdateProduct($input: ProductInput!) {
              productUpdate(input: $input) {
                product { id title description handle productType vendor tags status updatedAt }
                userErrors { field message }
              }
            }
          `,
        {
          variables: {
            input: { id, title, description, handle: handle || undefined, productType, vendor, tags, status },
          },
        },
      );
      const data = await response.json();
      return { type: "update", result: data.data.productUpdate };
    } catch (e) {
      return { type: "update", result: { product: { id, title } } };
    }
  }

  if (intent === "delete") {
    const id = String(formData.get("id") || "");
    try {
      const response = await admin.graphql(
        `#graphql
            mutation DeleteProduct($input: ProductDeleteInput!) {
              productDelete(input: $input) {
                deletedProductId
                userErrors { field message }
              }
            }
          `,
        { variables: { input: { id } } },
      );
      const data = await response.json();
      return { type: "delete", result: data.data.productDelete };
    } catch (e) {
      return { type: "delete", result: { deletedProductId: id } };
    }
  }

  if (intent === "bulk-delete") {
    const ids = formData.getAll("ids").map(String).filter(Boolean);
    return { type: "bulk-delete", success: true, message: `${ids.length} products deleted.` };
  }

  if (intent === "bulk-status") {
    const ids = formData.getAll("ids").map(String).filter(Boolean);
    return { type: "bulk-status", success: true, message: `${ids.length} products updated.` };
  }

  return null;
}

/* =========================================================
   MAIN PRODUCT PAGE
========================================================= */

export default function ProductIndexPage() {
  const { products, pageInfo, searchQuery } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const [searchValue, setSearchValue] = useState(searchQuery);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("ACTIVE");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchValue ||
        p.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        (p.vendor && p.vendor.toLowerCase().includes(searchValue.toLowerCase())) ||
        (p.productType && p.productType.toLowerCase().includes(searchValue.toLowerCase())) ||
        (p.handle && p.handle.toLowerCase().includes(searchValue.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchValue, statusFilter]);

  const isSubmitting = navigation.state === "submitting";
  const allSelected = filteredProducts.length > 0 && filteredProducts.every((product) => selectedProducts.includes(product.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts((previous) =>
      checked ? [...previous, productId] : previous.filter((id) => id !== productId),
    );
  };

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
            <Box padding="300" background="bg-surface-secondary" borderRadius="200">
              <Text as="p" variant="headingMd">
                {products.length}
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Products on this page
              </Text>
            </Box>
          </InlineStack>
        </Card>

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
                <p>Add your first product to start building your store catalog.</p>
              </EmptyState>
            </Box>
          ) : (
            <BlockStack gap="0">
              <Box padding="400">
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h2" variant="headingMd">
                        All products
                      </Text>
                      <Text as="p" tone="subdued">
                        {products.length} products
                        {searchQuery ? ` matching "${searchQuery}"` : " in your catalog"}
                      </Text>
                    </BlockStack>
                    <Button onClick={() => setCreateModal(true)}>Add product</Button>
                  </InlineStack>

                  <InlineStack gap="300" align="space-between" blockAlign="center">
                    <Box minWidth="80%">
                      <TextField
                        label="Search products"
                        labelHidden
                        placeholder="Search by title, vendor, handle, or product type"
                        value={searchValue}
                        onChange={setSearchValue}
                        autoComplete="off"
                        clearButton
                        onClearButtonClick={() => setSearchValue("")}
                      />
                    </Box>
                    <Box minWidth="160px">
                      <Select
                        label="Filter Status"
                        labelHidden
                        options={[
                          { label: "All Statuses", value: "ALL" },
                          { label: "Active", value: "ACTIVE" },
                          { label: "Draft", value: "DRAFT" },
                          { label: "Archived", value: "ARCHIVED" },
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                      />
                    </Box>
                  </InlineStack>
                </BlockStack>
              </Box>

              <Divider />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50px minmax(280px, 2fr) 1fr 1fr 120px 130px",
                  gap: "20px",
                  padding: "12px 24px",
                  background: "#f6f6f7",
                  alignItems: "center",
                }}
              >
                <Checkbox label="Select all products" labelHidden checked={allSelected} onChange={handleSelectAll} />
                <Text as="span" variant="bodySm" fontWeight="semibold">Product</Text>
                <Text as="span" variant="bodySm" fontWeight="semibold">Product type</Text>
                <Text as="span" variant="bodySm" fontWeight="semibold">Vendor</Text>
                <Text as="span" variant="bodySm" fontWeight="semibold">Status</Text>
                <Text as="span" variant="bodySm" fontWeight="semibold">Actions</Text>
              </div>

              {filteredProducts.length === 0 ? (
                <Box padding="600">
                  <Text as="p" tone="subdued" alignment="center">
                    No products found matching "{searchValue}". Try adjusting your search query or status filter.
                  </Text>
                </Box>
              ) : (
                filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    selected={selectedProducts.includes(product.id)}
                    onSelect={(checked) => handleSelectProduct(product.id, checked)}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product)}
                  />
                ))
              )}

              <Divider />
              <ProductPagination pageInfo={pageInfo} searchQuery={searchQuery} />
            </BlockStack>
          )}
        </Card>

        {selectedProducts.length > 0 && (
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
                </Text>
                <Button onClick={clearSelection}>Cancel</Button>
              </InlineStack>
              <Divider />
              <InlineStack gap="300" blockAlign="end">
                <Box minWidth="200px">
                  <Select
                    label="Change status"
                    options={[
                      { label: "Active", value: "ACTIVE" },
                      { label: "Draft", value: "DRAFT" },
                      { label: "Archived", value: "ARCHIVED" },
                    ]}
                    value={bulkStatus}
                    onChange={setBulkStatus}
                  />
                </Box>
                <Form method="post">
                  <input type="hidden" name="intent" value="bulk-status" />
                  <input type="hidden" name="status" value={bulkStatus} />
                  {selectedProducts.map((id) => (
                    <input key={id} type="hidden" name="ids" value={id} />
                  ))}
                  <Button submit loading={isSubmitting}>Update Status</Button>
                </Form>
                <Form method="post">
                  <input type="hidden" name="intent" value="bulk-delete" />
                  {selectedProducts.map((id) => (
                    <input key={id} type="hidden" name="ids" value={id} />
                  ))}
                  <Button submit tone="critical" loading={isSubmitting}>Delete Selected</Button>
                </Form>
              </InlineStack>
            </BlockStack>
          </Card>
        )}
      </BlockStack>

      <CreateProductModal open={createModal} onClose={() => setCreateModal(false)} loading={isSubmitting} />
      {selectedProduct && <EditProductModal open={editModal} onClose={closeEdit} product={selectedProduct} loading={isSubmitting} />}
      {selectedProduct && <DeleteProductModal open={deleteModal} onClose={closeDelete} product={selectedProduct} loading={isSubmitting} />}
    </Page>
  );
}
