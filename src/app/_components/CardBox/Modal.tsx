import { mdiClose } from "@mdi/js";
import { ReactNode } from "react";
import type { ColorButtonKey } from "../../_interfaces";
import Button from "../Button";
import Buttons from "../Buttons";
import CardBox from ".";
import CardBoxComponentTitle from "./Component/Title";
import OverlayLayer from "../OverlayLayer";

type Props = {
  title: string;
  buttonColor: ColorButtonKey;
  buttonLabel: string;
  isActive: boolean;
  children: ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  className?: string;
  hideFooter?: boolean; // Add this line
};

const CardBoxModal = ({
  title,
  buttonColor,
  buttonLabel,
  isActive,
  children,
  onConfirm,
  onCancel,
  className,
  hideFooter, // Add this line
}: Props) => {
  if (!isActive) {
    return null;
  }

  const footer = hideFooter ? null : (
    <Buttons className="flex flex-wrap justify-end gap-2">
      <Button
        label={buttonLabel}
        color={buttonColor}
        onClick={onConfirm}
        isGrouped
        className="mb-1"
      />
      {!!onCancel && (
        <Button
          label="Cancel"
          color={buttonColor}
          outline
          onClick={onCancel}
          isGrouped
          className="mb-1"
        />
      )}
    </Buttons>
  );

  return (
    <OverlayLayer
      onClick={onCancel}
      className={onCancel ? "cursor-pointer" : ""}
    >
      <CardBox
        className={`transition-transform shadow-lg max-h-modal w-11/12 md:w-3/5 lg:w-2/5 xl:w-4/12 z-50 overflow-hidden ${className}`}
        isModal
        footer={footer}
      >
        <CardBoxComponentTitle title={title}>
          {!!onCancel && (
            <Button
              icon={mdiClose}
              color="whiteDark"
              onClick={onCancel}
              small
              roundedFull
            />
          )}
        </CardBoxComponentTitle>

        <div className="space-y-3">{children}</div>
      </CardBox>
    </OverlayLayer>
  );
};

export default CardBoxModal;
