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
  IconExternalLink,
  IconBug,
  IconShield,
  IconClock,
  IconAlertTriangle,
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

export const vulnerabilitySchema = z.object({
  id: z.string(),
  severity: z.string(),
  title: z.string(),
  description: z.string(),
  cvssScore: z.number(),
  cvssVector: z.string(),
  package: z.object({
    name: z.string(),
    version: z.string(),
    fixedVersion: z.string(),
  }),
  publishedDate: z.string(),
  lastModifiedDate: z.string(),
  references: z.array(z.string()),
  exploitAvailable: z.boolean(),
  epssScore: z.number(),
  fixAvailable: z.boolean(),
  imageId: z.number(),
});

type Vulnerability = z.infer<typeof vulnerabilitySchema>;

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

function getCvssScoreBadgeVariant(score: number) {
  if (score >= 9) return "destructive";
  if (score >= 7) return "secondary";
  if (score >= 4) return "outline";
  return "default";
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays < 1) return "Today";
  if (diffInDays < 7) return `${diffInDays}d ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
  return `${Math.floor(diffInDays / 365)}y ago`;
}

const columns: ColumnDef<Vulnerability>[] = [
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
    accessorKey: "id",
    header: "CVE ID",
    cell: ({ row }) => {
      const vulnerability = row.original;
      return (
        <Link
          href={`/vulnerable-images/${vulnerability.imageId}/vulnerabilities/${vulnerability.id}`}
          className="flex flex-col gap-1 hover:underline"
        >
          <div className="font-medium font-mono text-sm">
            {vulnerability.id}
          </div>
          <div className="text-xs text-muted-foreground line-clamp-2">
            {vulnerability.title}
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
          {row.original.exploitAvailable && (
            <IconAlertTriangle
              className="h-4 w-4 text-destructive"
              title="Exploit Available"
            />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "cvssScore",
    header: "CVSS Score",
    cell: ({ row }) => {
      const score = row.original.cvssScore;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={getCvssScoreBadgeVariant(score)}
            className="min-w-12 justify-center"
          >
            {score.toFixed(1)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "package",
    header: "Package",
    cell: ({ row }) => {
      const pkg = row.original.package;
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium">{pkg.name}</div>
          <div className="text-xs text-muted-foreground">
            Current: {pkg.version}
          </div>
          {row.original.fixAvailable && (
            <div className="text-xs text-green-600 dark:text-green-400">
              Fixed in: {pkg.fixedVersion}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "epssScore",
    header: "EPSS Score",
    cell: ({ row }) => {
      const epss = row.original.epssScore;
      const percentage = (epss * 100).toFixed(1);
      return (
        <div className="text-sm">
          {percentage}%
          <div className="text-xs text-muted-foreground">
            Exploit probability
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "publishedDate",
    header: "Published",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm">
        <IconClock className="h-3 w-3 text-muted-foreground" />
        {formatTimeAgo(row.original.publishedDate)}
      </div>
    ),
  },
  {
    accessorKey: "fixAvailable",
    header: "Fix Available",
    cell: ({ row }) => {
      const hasfix = row.original.fixAvailable;
      return (
        <Badge variant={hasfix ? "default" : "secondary"}>
          {hasfix ? "Yes" : "No"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const vulnerability = row.original;
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
              <Link
                href={`/vulnerable-images/${vulnerability.imageId}/vulnerabilities/${vulnerability.id}`}
                className="w-full"
              >
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <a
                href={vulnerability.references[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full"
              >
                View CVE
                <IconExternalLink className="h-3 w-3" />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>Add to Allowlist</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark as False Positive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ImageVulnerabilitiesTable({
  data: initialData,
  imageId,
}: {
  data: Vulnerability[];
  imageId: number;
}) {
  const [data] = React.useState(() =>
    initialData.filter((vuln) => vuln.imageId === imageId)
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "cvssScore", desc: true },
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

  const selectedVulns = table.getFilteredSelectedRowModel().rows.length;
  const totalVulns = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by CVE ID or package..."
            value={(table.getColumn("id")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("id")?.setFilterValue(event.target.value)
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
              (table.getColumn("fixAvailable")?.getFilterValue() as string) ??
              ""
            }
            onValueChange={(value) =>
              table
                .getColumn("fixAvailable")
                ?.setFilterValue(value === "all" ? "" : value === "true")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Fix status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All fixes</SelectItem>
              <SelectItem value="true">Fix available</SelectItem>
              <SelectItem value="false">No fix</SelectItem>
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
            <IconBug className="h-4 w-4" />
            <span className="hidden lg:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {selectedVulns > 0 && (
        <div className="flex items-center gap-4 rounded-lg border bg-muted/50 p-3">
          <IconShield className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            {selectedVulns} of {totalVulns} vulnerabilities selected
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
                  No vulnerabilities found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {selectedVulns} of {totalVulns} vulnerability(ies) selected.
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
