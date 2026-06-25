import Modal from "./Modal";
import Button from "./ui/Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  pending?: boolean;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={pending ? () => {} : onClose} title={title}>
      <p className="text-[14.5px] text-gray-800 mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Working..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
