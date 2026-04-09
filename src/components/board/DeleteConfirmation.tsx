import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import styles from './DeleteConfirmation.module.css';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  taskTitle: string;
}

function DeleteConfirmation({ isOpen, onConfirm, onCancel, taskTitle }: DeleteConfirmationProps) {
  const footer = (
    <div className={styles.footer}>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={onConfirm}>
        Delete
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Delete Task" footer={footer}>
      <p className={styles.message}>
        Are you sure you want to delete <strong>&lsquo;{taskTitle}&rsquo;</strong>? This cannot be
        undone.
      </p>
    </Modal>
  );
}

export { DeleteConfirmation };
