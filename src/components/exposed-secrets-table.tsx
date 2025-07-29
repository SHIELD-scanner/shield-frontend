"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconLayoutColumns,
  IconEye,
  IconEyeOff,
  IconShield,
  IconClock,
  IconAlertTriangle,
  IconKey,
  IconCode,
  IconFileText,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const exposedSecretSchema = z.object({
  id: z.string(),
  secretType: z.string(),
  ruleId: z.string(),
  category: z.string(),
  severity: z.string(),
  title: z.string(),
  description: z.string(),
  match: z.string(),
  file: z.string(),
  line: z.number(),
  column: z.number(),
  code: z.string(),
  imageId: z.number(),
  imageName: z.string(),
  tag: z.string(),
  namespace: z.string(),
  workload: z.string(),
  detectedDate: z.string(),
  status: z.string(),
  falsePositive: z.boolean(),
  suppressed: z.boolean(),
  confidence: z.string(),
  entropy: z.number(),
});

type ExposedSecret = z.infer<typeof exposedSecretSchema>;

function getSeverityBadgeVariant(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "destructive";
    case "high":
      return "secondary";
    case "medium":
      return "outline";
    case "low":
      return "default";
    default:
      return "outline";
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "destructive";
    case "suppressed":
      return "outline";
    case "resolved":
      return "default";
    default:
      return "outline";
  }
}

function getConfidenceBadgeVariant(confidence: string) {
  switch (confidence.toLowerCase()) {
    case "high":
      return "default";
    case "medium":
      return "secondary";
    case "low":
      return "outline";
    default:
      return "outline";
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
}

function getCategoryIcon(category: string) {
  switch (category.toLowerCase()) {
    case "aws":
    case "azure":
    case "google":
      return IconShield;
    case "github":
    case "gitlab":
      return IconCode;
    case "database":
      return IconFileText;
    case "cryptography":
    case "ssh":
      return IconKey;
    default:
      return IconKey;
  }
}

const columns: ColumnDef<ExposedSecret>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "secretType",
    header: "Secret Type",
    cell: ({ row }) => {
      const secret = row.original;
      const CategoryIcon = getCategoryIcon(secret.category);

      return (
        <Link
          href={`/exposed-secrets/${secret.id}`}
          className="flex items-center gap-2 hover:underline"
        >
          <CategoryIcon className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <div className="font-medium">{secret.secretType}</div>
            <div className="text-xs text-muted-foreground">{secret.ruleId}</div>
          </div>
        </Link>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => {
      const severity = row.original.severity;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={getSeverityBadgeVariant(severity)}
            className="capitalize"
          >
            {severity}
          </Badge>
          {row.original.falsePositive && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Marked as false positive</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground">
        {row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: "imageName",
    header: "Image",
    cell: ({ row }) => {
      const secret = row.original;
      return (
        <Link
          href={`/vulnerable-images/${secret.imageId}`}
          className="flex flex-col gap-1 hover:underline"
        >
          <div className="font-medium">
            {secret.imageName}:{secret.tag}
          </div>
          <div className="text-xs text-muted-foreground">{secret.workload}</div>
        </Link>
      );
    },
  },
  {
    accessorKey: "file",
    header: "Location",
    cell: ({ row }) => {
      const secret = row.original;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-mono text-sm">{secret.file}</div>
          <div className="text-xs text-muted-foreground">
            Line {secret.line}, Column {secret.column}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "match",
    header: "Match",
    cell: ({ row }) => {
      const [showSecret, setShowSecret] = React.useState(false);
      const secret = row.original;

      return (
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm bg-muted px-2 py-1 rounded max-w-[200px] truncate">
            {showSecret
              ? secret.code.substring(0, 50) +
                (secret.code.length > 50 ? "..." : "")
              : secret.match}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? (
              <IconEyeOff className="h-3 w-3" />
            ) : (
              <IconEye className="h-3 w-3" />
            )}
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      const confidence = row.original.confidence;
      const entropy = row.original.entropy;
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={getConfidenceBadgeVariant(confidence)}
            className="capitalize"
          >
            {confidence}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Entropy: {entropy.toFixed(1)}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const suppressed = row.original.suppressed;

      return (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
            {status}
          </Badge>
          {suppressed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Suppressed from alerts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "namespace",
    header: "Namespace",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground">
        {row.original.namespace}
      </Badge>
    ),
  },
  {
    accessorKey: "detectedDate",
    header: "Detected",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <IconClock className="h-3 w-3 text-muted-foreground" />
        {formatTimeAgo(row.original.detectedDate)}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const secret = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Link href={`/exposed-secrets/${secret.id}`} className="w-full">
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Mark as False Positive</DropdownMenuItem>
            <DropdownMenuItem>Suppress Alerts</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Add to Allowlist</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              Delete Secret
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ExposedSecretsTable({
  data: initialData,
}: {
  data: ExposedSecret[];
}) {
  const [data] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "severity", desc: true },
  ]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedSecrets = table.getFilteredSelectedRowModel().rows.length;
  const totalSecrets = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter secrets..."
            value={
              (table.getColumn("secretType")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("secretType")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={
              (table.getColumn("severity")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table
                .getColumn("severity")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("status")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suppressed">Suppressed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={
              (table.getColumn("category")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table
                .getColumn("category")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="AWS">AWS</SelectItem>
              <SelectItem value="GitHub">GitHub</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
              <SelectItem value="Cryptography">Cryptography</SelectItem>
              <SelectItem value="API">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="h-4 w-4" />
                <span className="hidden lg:inline">Columns</span>
                <IconChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <IconShield className="h-4 w-4" />
            <span className="hidden lg:inline">Scan All Images</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {selectedSecrets > 0 && (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
          <IconKey className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {selectedSecrets} of {totalSecrets} secrets selected
          </span>
          <Button size="sm" variant="outline">
            Bulk Actions
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No secrets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {selectedSecrets} of {totalSecrets} secret(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
