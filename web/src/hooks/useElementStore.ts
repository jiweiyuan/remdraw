import { create } from 'zustand'
import {ExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";
export type flashcardAction = "occlusion" | "cloze" | null;
export type displayType = "all" | "front" | "back";
interface ElementState {
    elementId: string;
    elementDisplay: string;
    elementFlashcardAction: flashcardAction;
    element: ExcalidrawElement;
    setElementId: (id: string) => void;
    setElementFlashcardAction: (action: flashcardAction) => void;
    setElement: (element: ExcalidrawElement) => void;
    setElementDisplay: (display: displayType) => void;
}

export const useElementStore = create<ElementState>((set) => ({
    elementId: "",
    elementDisplay: "all",
    element: {} as ExcalidrawElement,
    elementFlashcardAction: null,
    setElementId: (elementId: string) => set({ elementId }),
    setElement: (element: ExcalidrawElement) => set({ element }),
    setElementFlashcardAction: (elementFlashcardAction: flashcardAction) => set({ elementFlashcardAction }),
    setElementDisplay: (elementDisplay: displayType) => set({ elementDisplay }),
}));
