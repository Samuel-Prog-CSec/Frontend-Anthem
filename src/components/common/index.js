/**
 * Re-exports de componentes comunes
 */

export { Button } from './Button';
export { buttonVariants } from './buttonVariants';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './Card';
export { Input } from './Input';
export { Select } from './Select';
export { Badge } from './Badge';
export { badgeVariants } from './badgeVariants';
export { Spinner, LoadingState } from './Spinner';
export { EmptyState } from './EmptyState';
export { ErrorState } from './ErrorState';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './Table';
export { Pagination } from './Pagination';
export { ErrorBoundary } from './ErrorBoundary';
export { Skeleton, TableSkeleton, StatsSkeleton, CardSkeleton, ChartSkeleton } from './Skeleton';
export { EnlacesCruzados } from './EnlacesCruzados';
export { StatusStrip } from './StatusStrip';

// Primitives basados en Radix UI (migracion v1.1)
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
  DialogPortal
} from './Dialog';
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetOverlay,
  SheetPortal
} from './Sheet';
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from './Popover';
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup
} from './DropdownMenu';
