/**
 * Componentes Dialog (modal) basados en Radix UI Dialog.
 *
 * Composicion estilo shadcn/ui adaptada a los tokens semanticos del proyecto
 * (`bg-card`, `text-foreground`, `border-border`, etc.). Resuelve focus trap,
 * ESC handling, aria-modal y manejo de scroll del body de forma automatica.
 *
 * Uso:
 * <Dialog>
 *   <DialogTrigger asChild><Button>Abrir</Button></DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Titulo</DialogTitle>
 *       <DialogDescription>Descripcion opcional</DialogDescription>
 *     </DialogHeader>
 *     <p>Contenido del modal</p>
 *     <DialogFooter>
 *       <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
 *       <Button onClick={confirmar}>Confirmar</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 *
 * Documentacion de referencia:
 * - Radix UI Dialog: https://www.radix-ui.com/primitives/docs/components/dialog
 * - Shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
 */

import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 bg-background/80',
        className
      )}
      {...props}
    />
  );
});
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = forwardRef(function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6',
          'border border-[var(--border-emphasis)] bg-popover text-foreground rounded-xl',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            className={cn(
              'absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:pointer-events-none'
            )}
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 gap-2', className)}
      {...props}
    />
  );
}

const DialogTitle = forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight font-display', className)}
      {...props}
    />
  );
});
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
DialogDescription.displayName = 'DialogDescription';

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
};
