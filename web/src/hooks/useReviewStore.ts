import { create } from 'zustand'
import {getReviewFrame, listReviews} from "@/request/review.ts";
import {BinaryFileData} from "@excalidraw/excalidraw/types/types";
import {getSceneFile} from "@/request/scene.ts";

interface ReviewState {
    frameId: string; // current frame id to be reviewed
    count: number; // total number of frames to be reviewed
    frames: any[]; // list of frames to be reviewed
    prefetchedFrame: any; // prefetched frame data including elements and scheduling
    prefetchedFrameFiles: any; // prefetched frame files
    listTodayReviews: () => void;
    getCurrentReview: () => any;
    moveNextReview: (frameId: string) => void;
    getCurrentReviewFrame: () => any;
    prefetchFrame: (frameId: string) => void;
    prefetchFrameFiles: (frameId: string, files: []) => void;
    removePrefetchedFrame: (frameId: string) => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
    frameId: '',
    count: 0,
    frames: [],
    prefetchedFrame: new Map(),
    prefetchedFrameFiles : new Map(),
    listTodayReviews: async () => {
        listReviews().then((data) => {
            if (!(data?.frames)) { return }
            set({ frames: data.frames || []})
            set({ count: data.count || 0})
            set({ frameId: data?.frames[0] ? data.frames[0]?.id : ''})
        })
    },
    getCurrentReview: () => {
        return get().frameId
    },

    moveNextReview: (frameId: string) => {
        console.log("executing moveNextReview", get().frameId)
        const frames = get().frames
        const currentIndex = frames.findIndex((frame) => frame.id === frameId)
        if (currentIndex === -1 || currentIndex === frames.length - 1) {
            set({frameId: ""})
            set({count: 0})
            return
        } else {
            set({ frameId: frames[currentIndex + 1]?.id})
            set({count: get().count - 1})
        }

        setTimeout(() => {
            const currentIndex = frames.findIndex((frame) => frame.id === get().frameId)
            if (currentIndex === -1 || currentIndex === frames.length - 1) {
                return
            } else {
                get().prefetchFrame(frames[currentIndex + 1]?.id)
            }
        })
    },

    getCurrentReviewFrame: async () => {
        console.log("executing getCurrentReviewFrame", get().frameId)
        const frameId = get().frameId
        if (!frameId) return

        if (get().prefetchedFrame.has(frameId)) {
            return get().prefetchedFrame.get(frameId)
        }
        return await getReviewFrame(frameId)
    },

    prefetchFrame: async (frameId: string) => {
        console.log("executing prefetchFrame", frameId)
        const data: { elements: any, scheduling: any, frame:any, files: any } = await getReviewFrame(frameId)
        if (!data) return;
        set({ prefetchedFrame: new Map(get().prefetchedFrame).set(frameId, data) })

        get().prefetchFrameFiles(frameId, data.files)
    },

    prefetchFrameFiles: async (frameId: string, files: []) => {
        const excalidrawFiles: BinaryFileData[] = [];
        const promises = (files || []).map(async (file: { oss_key: string; id: any; mimeType: any; create_ts: any; }) => {
            if (!file.oss_key) return;
            const data = await getSceneFile(file.oss_key);
            if (!data) return;
            excalidrawFiles.push({
                id: file.id,
                dataURL: data,
                mimeType: file.mimeType,
                created: new Date(file.create_ts).getTime()
            } as BinaryFileData);
        });

        // Wait for all promises to resolve
        await Promise.all(promises);
        set({ prefetchedFrameFiles: new Map(get().prefetchedFrameFiles).set(frameId, excalidrawFiles) })
    },

    removePrefetchedFrame: (frameId: string) => {
        const prefetchedFrame = get().prefetchedFrame
        const prefetchedFrameFiles = get().prefetchedFrameFiles
        prefetchedFrame.delete(frameId)
        prefetchedFrameFiles.delete(frameId)
        set({ prefetchedFrame })
        set({ prefetchedFrameFiles })
    }
}));
