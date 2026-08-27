import { useState } from "react";
import {
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  Thumbnail,
  Box,
  Divider,
  Button,
  TextField,
  Select,
  Modal,
} from "@shopify/polaris";
import type { Product } from "../../types/product";
import { ActionToast } from "../shared/ActionToast";

type Props = {
  product: Product;
};

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;
};

export default function ProductDetails({ product }: Props) {
  const defaultPrice = 29.99;
  const [quantity, setQuantity] = useState("1");
  const [selectedVariant, setSelectedVariant] = useState("Standard Pack");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout Form State
  const [custName, setCustName] = useState("Sarah Connor");
  const [custEmail, setCustEmail] = useState("sarah@cyberdyne.com");
  const [address, setAddress] = useState("742 Evergreen Terrace, Springfield, OR");
  const [carrier, setCarrier] = useState("DHL");
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const parsedQty = parseInt(quantity) || 1;
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountMultiplier = discountApplied ? 0.8 : 1.0;
  const finalTotal = (cartSubtotal > 0 ? cartSubtotal : defaultPrice * parsedQty) * discountMultiplier;

  const handleAddToCart = () => {
    const existing = cart.find((c) => c.title === product.title && c.variant === selectedVariant);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.title === product.title && c.variant === selectedVariant
            ? { ...c, quantity: c.quantity + parsedQty }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: `item-${Date.now()}`,
          title: product.title,
          price: defaultPrice,
          quantity: parsedQty,
          variant: selectedVariant,
          image: product.featuredImage?.url,
        },
      ]);
    }
    setToastMessage(`Added ${parsedQty} unit(s) of ${product.title} to Cart!`);
  };

  const handleBuyNow = () => {
    if (cart.length === 0) {
      setCart([
        {
          id: `item-${Date.now()}`,
          title: product.title,
          price: defaultPrice,
          quantity: parsedQty,
          variant: selectedVariant,
          image: product.featuredImage?.url,
        },
      ]);
    }
    setIsCheckoutOpen(true);
  };

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "SAVE20" || discountCode.length > 0) {
      setDiscountApplied(true);
      setToastMessage("20% Promo discount code applied!");
    }
  };

  const handleCompletePayment = () => {
    const orderId = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const trk = `${carrier.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setCart([]);
    setToastMessage(`Payment Success! Order ${orderId} placed. Tracking: ${trk}`);
  };

  return (
    <BlockStack gap="500">
      {/* PRODUCT HEADER & ORDER ACTIONS */}
      <Card>
        <InlineStack gap="500" blockAlign="start" wrap={false}>
          <Thumbnail
            source={
              product.featuredImage?.url ||
              "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_small.png"
            }
            alt={product.featuredImage?.altText || product.title}
            size="large"
          />

          <BlockStack gap="300">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">
                {product.title}
              </Text>
              <InlineStack gap="200" blockAlign="center">
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
                <Text as="span" tone="subdued">
                  {product.handle}
                </Text>
              </InlineStack>
            </BlockStack>

            <Text as="h2" variant="heading2xl">
              ${defaultPrice.toFixed(2)} USD
            </Text>

            {/* VARIANT & QUANTITY FORM */}
            <Box paddingBlock="200">
              <BlockStack gap="300">
                <InlineStack gap="400">
                  <Box minWidth="180px">
                    <Select
                      label="Select Variant / Packaging"
                      options={[
                        { label: "Standard Pack", value: "Standard Pack" },
                        { label: "Express Freight Pack", value: "Express Freight Pack" },
                        { label: "Bulk Commercial Container", value: "Bulk Commercial Container" },
                      ]}
                      value={selectedVariant}
                      onChange={setSelectedVariant}
                    />
                  </Box>

                  <Box minWidth="100px">
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={setQuantity}
                      autoComplete="off"
                    />
                  </Box>
                </InlineStack>

                <InlineStack gap="300">
                  <Button variant="primary" onClick={handleBuyNow}>
                    ⚡ Buy / Order Now
                  </Button>
                  <Button onClick={handleAddToCart}>
                    🛒 Add to Cart
                  </Button>
                  <Button onClick={() => setIsCartOpen(true)}>
                    {`View Cart (${cart.reduce((a, b) => a + b.quantity, 0)})`}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Box>
          </BlockStack>
        </InlineStack>
      </Card>

      {/* PRODUCT INFORMATION */}
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Product information
          </Text>
          <Divider />
          <InlineStack align="space-between">
            <Text as="span">Product type</Text>
            <Text as="span" fontWeight="semibold">{product.productType || "Shipping Supplies"}</Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="span">Vendor</Text>
            <Text as="span" fontWeight="semibold">{product.vendor || "Efficient Shipping"}</Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="span">Product Handle</Text>
            <Text as="span" fontWeight="semibold">{product.handle}</Text>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* DESCRIPTION */}
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Description
          </Text>
          <Divider />
          <Text as="p">
            {product.description || "High-quality, eco-friendly shipping and packaging product designed for swift order fulfillment."}
          </Text>
        </BlockStack>
      </Card>

      {/* TAGS */}
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingMd">
            Tags & Attributes
          </Text>
          <Divider />
          {product.tags?.length ? (
            <InlineStack gap="200">
              {product.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </InlineStack>
          ) : (
            <Text as="p" tone="subdued">No tags added.</Text>
          )}
        </BlockStack>
      </Card>

      {/* CART MODAL */}
      <Modal
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Shopping Cart"
        primaryAction={{
          content: "Proceed to Checkout",
          onAction: () => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          },
        }}
        secondaryActions={[
          {
            content: "Continue Shopping",
            onAction: () => setIsCartOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            {cart.length === 0 ? (
              <Text as="p" tone="subdued">Your cart is currently empty.</Text>
            ) : (
              cart.map((item) => (
                <Box key={item.id} paddingBlock="200">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="span" variant="bodyMd" fontWeight="bold">
                        {item.title} ({item.variant})
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        Quantity: {item.quantity} x ${item.price.toFixed(2)}
                      </Text>
                    </BlockStack>
                    <Text as="span" variant="bodyLg" fontWeight="bold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </InlineStack>
                </Box>
              ))
            )}
            <Divider />
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">Subtotal:</Text>
              <Text as="h2" variant="headingLg">${cartSubtotal.toFixed(2)} USD</Text>
            </InlineStack>
          </BlockStack>
        </Modal.Section>
      </Modal>

      {/* CHECKOUT & PAYMENT MODAL */}
      <Modal
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Order Checkout & Payment"
        primaryAction={{
          content: `Pay & Complete Order ($${finalTotal.toFixed(2)})`,
          onAction: handleCompletePayment,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setIsCheckoutOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">Customer & Shipping Information</Text>
            <InlineStack gap="300">
              <TextField label="Full Name" value={custName} onChange={setCustName} autoComplete="off" />
              <TextField label="Email Address" value={custEmail} onChange={setCustEmail} type="email" autoComplete="off" />
            </InlineStack>
            <TextField label="Shipping Address" value={address} onChange={setAddress} autoComplete="off" />

            <Select
              label="Shipping Carrier"
              options={[
                { label: "DHL Express (1-2 Days)", value: "DHL" },
                { label: "FedEx Priority (2-3 Days)", value: "FEDEX" },
                { label: "UPS Ground (3-5 Days)", value: "UPS" },
                { label: "USPS Mail (3-5 Days)", value: "USPS" },
              ]}
              value={carrier}
              onChange={setCarrier}
            />

            <Select
              label="Payment Method"
              options={[
                { label: "Credit Card / Shop Pay", value: "CREDIT_CARD" },
                { label: "PayPal Express", value: "PAYPAL" },
                { label: "Cash On Delivery (COD)", value: "COD" },
              ]}
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

            <InlineStack gap="200" blockAlign="center">
              <Box minWidth="200px">
                <TextField
                  label="Discount Code"
                  value={discountCode}
                  onChange={setDiscountCode}
                  placeholder="e.g. SAVE20"
                  autoComplete="off"
                />
              </Box>
              <Button onClick={handleApplyDiscount}>Apply Code</Button>
            </InlineStack>

            <Divider />

            <BlockStack gap="100">
              {discountApplied && (
                <Badge tone="success">20% Promo Discount Applied!</Badge>
              )}
              <Text as="h2" variant="headingLg">
                Total Payment Due: ${finalTotal.toFixed(2)} USD
              </Text>
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>

      {toastMessage && (
        <ActionToast content={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </BlockStack>
  );
}