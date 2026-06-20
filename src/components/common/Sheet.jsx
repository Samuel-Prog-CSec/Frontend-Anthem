/**
 * Componentes Sheet (side panel) basados en Radix UI Dialog.
 *
 * Variante de Dialog que se desliza desde uno de los bordes de la pantalla
 * (`top`, `right`, `bottom`, `left`). Pensado para drawers de navegacion
 * mobile, paneles de filtros, edicion contextual, etc.
 *
 * Hereda automaticamente de Radix.Dialog:
 * - Focus trap (resuelve la pendencia A4 de auditoria FrontendUIUX)
 * - ESC handling
 * - aria-modal correcto
 * - Bloqueo de scroll del body
 *
 * Uso:
 * <Sheet open={open} onOpenChange={setOpen}>
 *   <SheetContent side="top">
 *     <SheetHeader>
 *       <SheetTitle>Menu</SheetTitle>
 *     </SheetHeader>
 *     ...
 *   </SheetContent>
 * </Sheet>
 */

import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '../../utils';

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = forwardRef(function SheetOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-40 bg-background/80',
        className
      )}
      {...props}
    />
  );
});
SheetOverlay.displayName = 'SheetOverlay';

const sheetVariants = cva(
  cn(
    'fixed z-50 gap-4 bg-popover text-foreground border-[var(--border-emphasis)]',
    'transition ease-in-out duration-300'
  ),
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b',
        bottom: 'inset-x-0 bottom-0 border-t',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
        right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm'
      }
    },
    defaultVariants: {
      side: 'right'
    }
  }
);

const SheetContent = forwardRef(function SheetContent({
  side = 'right',
  className,
  children,
  showCloseButton = true,
  ...props
}, ref) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = 'SheetContent';

function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 text-left p-4 border-b border-border/60', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-4 border-t border-border/60', className)}
      {...props}
    />
  );
}

const SheetTitle = forwardRef(function SheetTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold text-foreground font-display tracking-tight', className)}
      {...props}
    />
  );
});
SheetTitle.displayName = 'SheetTitle';

const SheetDescription = forwardRef(function SheetDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
SheetDescription.displayName = 'SheetDescription';

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
};
