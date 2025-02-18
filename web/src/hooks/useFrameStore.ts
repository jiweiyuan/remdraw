import { create } from 'zustand'
import {ExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";
type EventSource = "whiteboard" | "sidebar";
interface FrameState {
    id: string;
    eventSource: EventSource;
    elements: ExcalidrawElement[];
    presentationMode : boolean;
    setId: (id: string) => void;
    setElements: (elements: ExcalidrawElement[]) => void;
    setEventSource: (eventSource: EventSource) => void;
    setPresentationMode: (presentationMode: boolean) => void;
}

export const useFrameStore = create<FrameState>((set) => ({
    id: "",
    eventSource: "whiteboard",
    elements: [],
    setId: (id: string) => set({ id }),
    setElements: (elements: ExcalidrawElement[]) => set({ elements }),
    setEventSource: (eventSource: EventSource) => set({ eventSource }),
    presentationMode: false,
    setPresentationMode: (presentationMode: boolean) => set({ presentationMode }),
}));
