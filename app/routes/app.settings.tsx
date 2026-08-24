import { useState } from "react";
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  ChoiceList,
  Button,
  Divider,
  Box,
  Link,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

export async function loader() {
  // provides data to the component
  let settings = {
    storeName: "Efficient-shipping Store",
    businessAddress: "123 Main St, Anytown, USA",
    storePhone: "+1 (555) 123-4567",
    currency: ["usd"],
    frequency: "immediately",
    notifications: ["new-order"],
  }
  return json(settings);
}

export async function action({request}: ActionFunctionArgs) {
  // updates persistent data
  let formData = await request.formData();
  // formData = Object.fromEntries(formData);

  console.log(formData);
  return json({ message: "Settings updated successfully!" ,settings:formData});
}


export default function SettingsPage() {
  // const [storeName, setStoreName] = useState("Puzzlify Store");
  // const [businessAddress, setBusinessAddress] = useState("123 Main St, Anytown, USA");
  // const [storePhone, setStorePhone] = useState("+1 (555) 123-4567");
  // const [currency, setCurrency] = useState(["usd"]);
  // const [frequency, setFrequency] = useState("immediately");
  // const [notifications, setNotifications] = useState(["new-order"]);
  const settings = useLoaderData();

const [formState, setFormState] = useState({
  storeName: "Puzzlify Store",
  businessAddress: "123 Main St, Anytown, USA",
  storePhone: "+1 (555) 123-4567",
  currency: ["usd"],
  frequency: "immediately",
  notifications: ["new-order"],
});

  return (
    <Page>
      <TitleBar title="Settings" />
      <BlockStack gap="500">
        <Form
          method="POST"
          action="/app/settings"
        >
          <BlockStack gap="500">
            {/* Store Information */}
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                <Text as="h2" variant="headingMd">
                  Store Information
                </Text>
                <InlineStack gap="200" align="end">
                    <Button >Cancel</Button>
                    <Button submit={true} variant="primary">Save</Button>
                </InlineStack>
                </InlineStack>
                <TextField
                  label="Store name"
                  value={formState.storeName}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    storeName: value,
                  }))}
                  autoComplete="off"
                />
                <TextField
                  label="Business address"
                  value={formState.businessAddress}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    businessAddress: value,
                  }))}
                  autoComplete="off"
                />
                <TextField
                  label="Store phone"
                  value={formState.storePhone}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    storePhone: value,
                  }))}  
                  autoComplete="off"
                />
                <ChoiceList
                  title="Primary currency"
                  choices={[
                    { label: "US Dollar ($)", value: "usd" },
                    { label: "Canadian Dollar (CAD)", value: "cad" },
                    { label: "Euro (€)", value: "eur" },
                  ]}
                  selected={formState.currency}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    currency: value,
                  }))}
                />
              </BlockStack>
            </Card>

            {/* Notifications */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Notifications
                </Text>
                <Select
                  label="Notification frequency"
                  options={[
                    { label: "Immediately", value: "immediately" },
                    { label: "Hourly digest", value: "hourly" },
                    { label: "Daily digest", value: "daily" },
                  ]}
                  value={formState.frequency}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    frequency: value,
                  }))}
                />
                <ChoiceList
                  title="Notification types"
                  choices={[
                    { label: "New order notifications", value: "new-order" },
                    { label: "Low stock alerts", value: "low-stock" },
                    { label: "Customer review notifications", value: "customer-review" },
                    { label: "Shipping updates", value: "shipping-updates" },
                  ]}
                  selected={formState.notifications}
                  onChange={(value) => setFormState((prev) => ({
                    ...prev,
                    notifications: value,
                  }))}
                  allowMultiple
                />
              </BlockStack>
            </Card>

            {/* Connected accounts */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Connected accounts
                </Text>
                <InlineStack align="space-between" blockAlign="center">
                  <BlockStack gap="100">
                    <Text as="h3" variant="headingSm">
                      Puzzlify
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      No account connected
                    </Text>
                  </BlockStack>
                  <Button variant="primary">Connect</Button>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  By clicking Connect, you agree to accept Sample App's terms and
                  conditions. You'll pay a commission rate of 15% on sales made through
                  Sample App.
                </Text>
              </BlockStack>
            </Card>

            {/* Preferences */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Preferences
                </Text>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingSm">
                        Shipping & fulfillment
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Shipping methods, rates, zones, and fulfillment preferences.
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Divider />
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingSm">
                        Products & catalog
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Product defaults, customer experience, and catalog display options.
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  <Divider />
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingSm">
                        Customer support
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Support settings, help resources, and customer service tools.
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>

            {/* Tools */}
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Tools
                </Text>
                <BlockStack gap="300">
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingSm">
                        Reset app settings
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Reset all settings to their default values. This action cannot be undone.
                      </Text>
                    </BlockStack>
                    <Button tone="critical">Reset</Button>
                  </InlineStack>
                  <Divider />
                  <InlineStack align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <Text as="h3" variant="headingSm">
                        Export settings
                      </Text>
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Download a backup of all your current settings.
                      </Text>
                    </BlockStack>
                    <Button>Export</Button>
                  </InlineStack>
                </BlockStack>
              </BlockStack>
            </Card>
          </BlockStack>
        </Form>

        {/* Footer help */}
        <Box paddingBlockStart="400">
          <InlineStack align="center">
            <Text as="p" variant="bodySm" tone="subdued">
              Learn more about{" "}
              <Link url="https://help.shopify.com" external>
                quality scoring best practices
              </Link>
              .
            </Text>
          </InlineStack>
        </Box>
      </BlockStack>
    </Page>
  );
}

