import { create } from 'zustand'
import {createFrame, deleteFrame, listFrameBySceneID} from "@/request/frame.ts";

interface Frame {
    id: string;
    scene_id: string;
}

interface SceneState {
    id: string;
    sceneDisplay: "front" | "back" | "all";
    setSceneDisplay: (tab: "front" | "back" | "all") => void;
    frames: Frame[];
    setSceneId:  (id: string) => void;
    fetchFrames: (frames: Frame[]) => void;
    isSavedOnServer: (id: string) => boolean;
    addFrame: (id: string) => void;
    removeFrame: (id: string) => void;
}

export const useSceneStore = create<SceneState>((set, get) => ({
    id: "",
    frames: [],
    sceneDisplay: "all" as "front" | "back" | "all",
    setSceneDisplay: (tab: "front" | "back" | "all") => set({ sceneDisplay: tab}),
    setSceneId: async (id: string) => {
        const data = await listFrameBySceneID(id)
        set({ id })
        set({ frames: data.frames || []})
    },
    fetchFrames: async () => {
        const data = await listFrameBySceneID(get().id)
        set({ frames: data.frames || []})
    },
    isSavedOnServer: (id: string) => {
        return get().frames.some((frame) => frame.id === id)
    },
    addFrame: async(id: string) => {
        const data = await createFrame({id, scene_id: get().id})
        if (data.id) {
            set({ frames: [...get().frames, {id, scene_id: get().id}]})
        }
    },
    removeFrame: async (id: string) => {
        const data = await deleteFrame( get().id, id)
        if (data.success) {
            set({ frames: get().frames.filter((frame) => frame.id !== id)})
        }
    }
}));
