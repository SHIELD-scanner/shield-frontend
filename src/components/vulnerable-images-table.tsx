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
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
  IconAlertTriangle,
  IconShield,
  IconClock,
  IconKey,
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

export const vulnerableImageSchema = z.object({
  id: z.number(),
  imageName: z.string(),
  tag: z.string(),
  registry: z.string(),
  repository: z.string(),
  fullName: z.string(),
  digest: z.string(),
  size: z.string(),
  vulnerabilityCount: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    total: z.number(),
  }),
  secretCount: z.object({
    critical: z.number(),
    high: z.number(),
    medium: z.number(),
    low: z.number(),
    total: z.number(),
  }),
  lastScanned: z.string(),
  riskScore: z.number(),
  status: z.string(),
  namespace: z.string(),
  workloads: z.array(z.string()),
});

type VulnerableImage = z.infer<typeof vulnerableImageSchema>;

function getRiskScoreBadgeVariant(score: number) {
  if (score >= 9) return "destructive";
  if (score >= 7) return "secondary";
  if (score >= 5) return "outline";
  return "default";
}

function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "default";
    case "deprecated":
      return "secondary";
    case "inactive":
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

const columns: ColumnDef<VulnerableImage>[] = [
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
    accessorKey: "imageName",
    header: "Image",
    cell: ({ row }) => {
      const image = row.original;
      return (
        <Link
          href={`/vulnerable-images/${image.id}`}
          className="flex flex-col gap-1 hover:underline"
        >
          <div className="font-medium">
            {image.imageName}:{image.tag}
          </div>
          <div className="text-xs text-muted-foreground">
            {image.repository}
          </div>
        </Link>
      );
    },
    enableHiding: false,
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
    accessorKey: "vulnerabilityCount",
    header: "Vulnerabilities",
    cell: ({ row }) => {
      const vulns = row.original.vulnerabilityCount;
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 text-xs">
            {vulns.critical > 0 && (
              <Badge variant="destructive" className="px-1 py-0 text-xs">
                {vulns.critical} Critical
              </Badge>
            )}
            {vulns.high > 0 && (
              <Badge variant="secondary" className="px-1 py-0 text-xs">
                {vulns.high} High
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {vulns.total} total vulnerabilities
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "secretCount",
    header: "Exposed Secrets",
    cell: ({ row }) => {
      const secrets = row.original.secretCount;
      if (secrets.total === 0) {
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconKey className="h-3 w-3" />
            No secrets
          </div>
        );
      }
      return (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 text-xs">
            {secrets.critical > 0 && (
              <Badge variant="destructive" className="px-1 py-0 text-xs">
                {secrets.critical} Critical
              </Badge>
            )}
            {secrets.high > 0 && (
              <Badge variant="secondary" className="px-1 py-0 text-xs">
                {secrets.high} High
              </Badge>
            )}
            {secrets.medium > 0 && (
              <Badge variant="outline" className="px-1 py-0 text-xs">
                {secrets.medium} Medium
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <IconKey className="h-3 w-3" />
            {secrets.total} exposed secrets
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "riskScore",
    header: "Risk Score",
    cell: ({ row }) => {
      const score = row.original.riskScore;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={getRiskScoreBadgeVariant(score)}
            className="min-w-12 justify-center"
          >
            {score.toFixed(1)}
          </Badge>
          {score >= 8 && (
            <IconAlertTriangle className="h-4 w-4 text-destructive" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getStatusBadgeVariant(row.original.status)}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => <div className="text-sm">{row.original.size}</div>,
  },
  {
    accessorKey: "lastScanned",
    header: "Last Scanned",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <IconClock className="h-3 w-3 text-muted-foreground" />
        {formatTimeAgo(row.original.lastScanned)}
      </div>
    ),
  },
  {
    accessorKey: "workloads",
    header: "Workloads",
    cell: ({ row }) => {
      const workloads = row.original.workloads;
      const displayCount = 2;
      const hasMore = workloads.length > displayCount;

      return (
        <div className="flex flex-wrap gap-1">
          {workloads.slice(0, displayCount).map((workload) => (
            <Badge key={workload} variant="outline" className="text-xs">
              {workload}
            </Badge>
          ))}
          {hasMore && (
            <Badge variant="outline" className="text-xs">
              +{workloads.length - displayCount} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
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
            <Link
              href={`/vulnerable-images/${row.original.id}`}
              className="w-full"
            >
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Rescan Image</DropdownMenuItem>
          <DropdownMenuItem>Add to Allowlist</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Remove Image
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export function VulnerableImagesTable({
  data: initialData,
}: {
  data: VulnerableImage[];
}) {
  const [data] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "riskScore", desc: true },
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
    getRowId: (row) => row.id.toString(),
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

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter images..."
            value={
              (table.getColumn("imageName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("imageName")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={
              (table.getColumn("namespace")?.getFilterValue() as string) ?? ""
            }
            onValueChange={(value) =>
              table
                .getColumn("namespace")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All namespaces" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All namespaces</SelectItem>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns className="h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
