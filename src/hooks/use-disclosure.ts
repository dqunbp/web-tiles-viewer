import { useState } from "react";

export function useDisclosure({ defaultIsOpen = false } = {}) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen((state) => !state),
  };
}
