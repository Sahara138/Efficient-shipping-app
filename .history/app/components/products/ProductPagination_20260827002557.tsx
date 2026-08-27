import {
  Box,
  InlineStack,
  Button,
} from "@shopify/polaris";

import type { ProductPageInfo } from "../../types/product";

type Props = {
  pageInfo: ProductPageInfo;
  searchQuery: string;
};

export default function ProductPagination({
  pageInfo,
  searchQuery,
}: Props) {
  const query = encodeURIComponent(
    searchQuery,
  );

  return (
    <Box padding="400">
      <InlineStack
        align="space-between"
        blockAlign="center"
      >
        <Button
          disabled={!pageInfo.hasPreviousPage}
          url={
            pageInfo.hasPreviousPage
              ? `/app/products?direction=previous&before=${pageInfo.startCursor}&query=${query}`
              : undefined
          }
        >
          Previous
        </Button>

        <Button
          disabled={!pageInfo.hasNextPage}
          url={
            pageInfo.hasNextPage
              ? `/app/products?direction=next&after=${pageInfo.endCursor}&query=${query}`
              : undefined
          }
        >
          Next
        </Button>
      </InlineStack>
    </Box>
  );
}