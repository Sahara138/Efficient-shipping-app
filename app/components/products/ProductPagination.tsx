import { Box, InlineStack, Button } from "@shopify/polaris";
import type { ProductPageInfo } from "../../types/product";

type Props = {
  pageInfo: ProductPageInfo;
  searchQuery: string;
  onPageChange?: (direction: "next" | "previous") => void;
};

export default function ProductPagination({
  pageInfo,
  searchQuery,
  onPageChange,
}: Props) {
  const query = encodeURIComponent(searchQuery);

  return (
    <Box padding="400">
      <InlineStack align="space-between" blockAlign="center">
        <Button
          disabled={!pageInfo.hasPreviousPage}
          onClick={onPageChange ? () => onPageChange("previous") : undefined}
          url={
            !onPageChange && pageInfo.hasPreviousPage
              ? `/app/product?direction=previous&before=${pageInfo.startCursor}&query=${query}`
              : undefined
          }
        >
          Previous
        </Button>

        <Button
          disabled={!pageInfo.hasNextPage}
          onClick={onPageChange ? () => onPageChange("next") : undefined}
          url={
            !onPageChange && pageInfo.hasNextPage
              ? `/app/product?direction=next&after=${pageInfo.endCursor}&query=${query}`
              : undefined
          }
        >
          Next
        </Button>
      </InlineStack>
    </Box>
  );
}