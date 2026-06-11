"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TaskForm } from "./TaskForm";

export function CreateTaskButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>
        New task
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New task"
        description="Capture something on your plate. You can edit it later."
      >
        <TaskForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
