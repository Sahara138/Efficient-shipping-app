import React from "react";
import {
  TextField,
  InlineStack,
  Button,
  Select,
  Pagination,
  Box,
} from "@shopify/polaris";

type FilterPaginationBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  bulkActions?: { content: string; onAction: () => void; destructive?: boolean }[];
  selectedCount?: number;
  pagination?: {
    hasNext: boolean;
    hasPrevious: boolean;
    onNext: () => void;
    onPrevious: () => void;
  };
};

export const FilterPaginationBar: React.FC<FilterPaginationBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search items...",
  filterOptions,
  selectedFilter,
  onFilterChange,
  bulkActions,
  selectedCount = 0,
  pagination,
}) => {
  return (
    <Box paddingBlockEnd="400">
      <InlineStack align="space-between" blockAlign="center" gap="400" wrap>
        <InlineStack gap="300" blockAlign="center">
          <Box minWidth="260px">
            <TextField
              label=""
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              clearButton
              onClearButtonClick={() => onSearchChange("")}
              autoComplete="off"
            />
          </Box>
          {filterOptions && onFilterChange && (
            <Box minWidth="160px">
              <Select
                label=""
                options={filterOptions}
                value={selectedFilter}
                onChange={onFilterChange}
              />
            </Box>
          )}
          {selectedCount > 0 && bulkActions && bulkActions.length > 0 && (
            <InlineStack gap="200">
              {bulkActions.map((action, idx) => (
                <Button
                  key={idx}
                  tone={action.destructive ? "critical" : undefined}
                  onClick={action.onAction}
                >
                  {`${action.content} (${selectedCount})`}
                </Button>
              ))}
            </InlineStack>
          )}
        </InlineStack>

        {pagination && (
          <Pagination
            hasPrevious={pagination.hasPrevious}
            onPrevious={pagination.onPrevious}
            hasNext={pagination.hasNext}
            onNext={pagination.onNext}
          />
        )}
      </InlineStack>
    </Box>
  );
};
