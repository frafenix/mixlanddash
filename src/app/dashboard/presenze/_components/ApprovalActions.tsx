import { useState } from "react";
import Button from "../../../_components/Button";
import { mdiCheckCircle, mdiClose } from "@mdi/js";

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function ApprovalActions({ onApprove, onReject }: ApprovalActionsProps) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setShowRejectForm(false);
      setRejectReason("");
    }
  };

  return (
    <div className="mt-4">
      {!showRejectForm ? (
        <div className="flex space-x-2">
          <Button
            color="success"
            icon={mdiCheckCircle}
            onClick={onApprove}
            label="Approva"
          />
          <Button
            color="danger"
            onClick={() => setShowRejectForm(true)}
            label="Rifiuta"
          />
        </div>
      ) : (
        <div className="border p-4 rounded-lg bg-gray-50 dark:bg-slate-800">
          <h3 className="font-medium mb-2">Motivo del rifiuto</h3>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 mb-3"
            rows={3}
            placeholder="Inserisci il motivo del rifiuto..."
          />
          <div className="flex space-x-2">
            <Button
              color="danger"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
              label="Conferma Rifiuto"
            />
            <Button
              color="white"
              icon={mdiClose}
              onClick={() => {
                setShowRejectForm(false);
                setRejectReason("");
              }}
              label="Annulla"
            />
          </div>
        </div>
      )}
    </div>
  );
}