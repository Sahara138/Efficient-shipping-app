import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Dashboard</Link>
        <Link to="/app/product">Products</Link>
        <Link to="/app/collections">Collections</Link>
        <Link to="/app/orders">Orders</Link>
        <Link to="/app/draft-orders">Draft Orders</Link>
        <Link to="/app/returns">Returns</Link>
        <Link to="/app/customers">Customers</Link>
        <Link to="/app/b2b">B2B & Companies</Link>
        <Link to="/app/inventory">Inventory</Link>
        <Link to="/app/locations">Locations</Link>
        <Link to="/app/shipping">Shipping</Link>
        <Link to="/app/discounts">Discounts</Link>
        <Link to="/app/gift-cards">Gift Cards</Link>
        <Link to="/app/subscriptions">Subscriptions</Link>
        <Link to="/app/metafields">Metafields</Link>
        <Link to="/app/metaobjects">Metaobjects</Link>
        <Link to="/app/files">Files & Media</Link>
        <Link to="/app/markets">Markets</Link>
        <Link to="/app/payments">Payments</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/settings">Settings</Link>
        <Link to="/app/pricing">Pricing</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
