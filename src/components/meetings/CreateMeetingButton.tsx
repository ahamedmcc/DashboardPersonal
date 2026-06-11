"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MeetingForm } from "./MeetingForm";

export function CreateMeetingButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>
        New meeting
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New meeting"
        description="Capture the meeting details. You can edit it later."
      >
        <MeetingForm onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
