import PageHead from "@/components/shared/page-head.tsx";
import {useReviewStore} from "@/hooks/useReviewStore.ts";
import {useEffect, useRef, useState} from "react";
import {Excalidraw} from "@excalidraw/excalidraw";
import {useCallbackRefState} from "@/hooks/useCallbackRefState.ts";
import {BinaryFileData, ExcalidrawImperativeAPI} from "@excalidraw/excalidraw/types/types";
import {useTheme} from "@/providers/theme-provider.tsx";
import { Badge } from "@/components/ui/badge"
import {formatTimeDifference} from "@/lib/time.ts";
import {getSceneFile} from "@/request/scene.ts";
import {Button} from "@/components/ui/button.tsx";
import {Maximize, Minimize} from "lucide-react";
import {cn} from "@/lib/utils.ts";
import {useFullscreen, useToggle, useWindowSize} from "react-use";
import {repeatFrame} from "@/request/review.ts";
import Confetti from "react-confetti";
import {extractElements, isFlashcard} from "@/lib/flashcard.ts";

export default function ReviewFrame() {
    const getCurrentReviewFrame = useReviewStore(state => state.getCurrentReviewFrame);
    const frameId = useReviewStore(state => state.frameId);
    const count = useReviewStore(state => state.count);
    const prefetchedFrame = useReviewStore(state => state.prefetchedFrame);
    const prefetchedFrameFiles = useReviewStore(state => state.prefetchedFrameFiles);
    const removePrefetchedFrame = useReviewStore(state => state.removePrefetchedFrame);
    const moveNextReview = useReviewStore(state => state.moveNextReview);
    const { theme, toggleLeftSidebar, closeSidebar } = useTheme()
    const ref = useRef(null);
    const [show, toggle] = useToggle(false);
    const [flashCardMode, setFlashCardMode] = useState(false);
    const isFullscreen = useFullscreen(ref, show, {onClose: () => toggle(false)});
    const [excalidrawAPI, excalidrawRefCallback] = useCallbackRefState<ExcalidrawImperativeAPI | null>();
    const [againTime, setAgainTime] = useState("");
    const [hardTime, setHardTime] = useState("");
    const [goodTime, setGoodTime] = useState("");
    const [easyTime, setEasyTime] = useState("");
    const [scheduling, setScheduling] = useState({});
    const { width, height } = useWindowSize()

    const setScheduleTime = (scheduling: Object, now: string) => {
        if (scheduling["1"]?.Card?.ElaspsedDays > 0) {
            setAgainTime(scheduling["1"]?.Card?.ElaspsedDays)
        } else {
            setAgainTime(formatTimeDifference(now, scheduling["1"]?.Card?.Due))
        }

        if (scheduling["2"]?.Card?.ElaspsedDays > 0) {
            setHardTime(scheduling["2"]?.Card?.ElaspsedDays)
        } else {
            setHardTime(formatTimeDifference(now, scheduling["2"]?.Card?.Due))
        }

        if (scheduling["3"]?.Card?.ElaspsedDays > 0) {
            setGoodTime(scheduling["3"]?.Card?.ElaspsedDays)
        } else {
            setGoodTime(formatTimeDifference(now, scheduling["3"]?.Card?.Due))
        }

        if (scheduling["4"]?.Card?.ElaspsedDays > 0) {
            setEasyTime(scheduling["4"]?.Card?.ElaspsedDays)
        } else {
            setEasyTime(formatTimeDifference(now, scheduling["4"]?.Card?.Due))
        }
    }

    const ratingReview = async (rating: string) => {
        const data = scheduling[rating]
        if (!data || !frameId) return;

        let { success } = await repeatFrame(frameId, data)
        if (success) {
            removePrefetchedFrame(frameId)
            if (count > 1) {
                moveNextReview(frameId)
                await displayFrame(getCurrentReviewFrame())
            } else {
                moveNextReview(frameId)
            }
        }
    }

    const toggleFullScreen = () => {
        if (isFullscreen) {
            toggleLeftSidebar()
        } else {
            closeSidebar()
        }
        toggle()
        beginReview().then(r => {})
    }

    const displayFrame = async (frameId: string) => {

        if (!prefetchedFrame.has(frameId)) {
            const data: { elements: any, scheduling: any, frame:any, files: any } = await getCurrentReviewFrame();
            if (!data) return;
            prefetchedFrame.set(frameId, data)
        }

        let frame: { elements: any, scheduling: any, frame:any, files: any } = prefetchedFrame.get(frameId)
        console.log("frame", frame.elements)
        if (isFlashcard(frame.elements)) {
            setFlashCardMode(true)
        }
        // fix wired bug using setTimeout, the excalidrawAPI is not ready
        setTimeout(() => {
            excalidrawAPI?.updateScene({
                elements: extractElements(frame.elements, "front"),
                appState: {
                    zenModeEnabled: true,
                    viewModeEnabled: true,
                },
            })
            excalidrawAPI?.scrollToContent(frame.elements, {
                fitToViewport: true,
            })
        })
        setScheduling(frame?.scheduling)
        setScheduleTime(frame?.scheduling, frame?.frame?.now)
        let excalidrawFiles: BinaryFileData[] = [];
        if (!prefetchedFrameFiles.has(frameId)) {
            const promises = (frame?.files || []).map(async (file: { oss_key: string; id: any; mimeType: any; create_ts: any; }) => {
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
            prefetchedFrameFiles.set(frameId, excalidrawFiles)

        }
        excalidrawAPI?.addFiles(prefetchedFrameFiles.get(frameId));
    }

    const beginReview = async () => {
        const frameId = getCurrentReviewFrame();
        if (!frameId) return
        await displayFrame(frameId)
    }
    const showAnswer = () => {
        setFlashCardMode(false)
        const elements = excalidrawAPI?.getSceneElements()
        excalidrawAPI?.updateScene({
            elements: extractElements(elements, "back"),
            appState: {
                zenModeEnabled: true,
                viewModeEnabled: true,
            },
        })

    }

    useEffect(() => {
        if (!excalidrawAPI) return
        beginReview().then(r => {})
    }, [excalidrawAPI]);

    useEffect(() => {
        // add right click event listener
        if (!excalidrawAPI) return;
        const canvas = document.querySelector(
            ".excalidraw__canvas.interactive"
        ) as HTMLCanvasElement;
        canvas?.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            event.stopPropagation();
        });

        const button = document.querySelector(".disable-zen-mode")
        // remove zen mode button
        button?.remove()
    }, [excalidrawAPI]);

    return (
        <div ref={ref} className="w-full h-full absolute">
            <PageHead title="Review Frame | Remdraw" />
            {(!frameId && !isFullscreen)
            ? null
            : <Button onClick={() => { toggleFullScreen()}}
                    className={"absolute top-4 right-4 z-30 w-9 h-9 bg-surface hover:bg-indigo-100 p-0 dropdown-menu-button main-menu-trigger zen-mode-transition"}
            >{isFullscreen
                    ? <Minimize size={16} className={"text-gray-500 font-extrabold"}/>
                    : <Maximize size={16} className={"text-gray-500 font-extrabold transform rotate-180"}/>
            }</Button>}
            {!frameId? <Confetti width={isFullscreen? width : width -  256} height={height} recycle={false} /> : null}
            {!frameId? <div className={cn("flex flex-col items-center justify-center h-full w-[calc(100%-40rem) space-y-4 bg-white",
            isFullscreen? "w-full": "")}>
                <h1 className="text-4xl my-2">No more frames to review</h1>
                <h2 className="text-xl">You have completed all the frames for today</h2>
            </div> : null}
            {frameId && <div className="w-full h-full absolute">
            <Excalidraw
                excalidrawAPI={excalidrawRefCallback}
                theme={theme === "system" ?
                    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
                    : theme}
                initialData={{
                    appState: {
                        zenModeEnabled: true,
                        viewModeEnabled: true,
                    },
                    scrollToContent: true
                }}
                UIOptions={{
                    dockedSidebarBreakpoint: 0,
                }}
                onPointerDown={(e) => {
                    console.log("pointer down");
                }
            }>
            </Excalidraw>
                {flashCardMode? <div className={cn("fixed pr-80 flex justify-center w-full bottom-4 z-10 space-x-4",
                        isFullscreen ? "ml-40" : "ml-40 w-[calc(100%-16rem)]"
                    )} onClick={() => {showAnswer()}}
                    >
                        <div
                            className={"cursor-pointer w-96 px-24 h-14 flex justify-center items-center p-1 border rounded-md hover:shadow space-y-0.5 select-none bg-surface hover:bg-indigo-50 active:bg-indigo-100"}
                        >
                            <span>Show Answer</span>
                        </div>
                    </div>
                    : <div className={cn("fixed pr-80 flex justify-center w-full bottom-4 z-10 space-x-4",
                        isFullscreen ? "ml-40" : "ml-40 w-[calc(100%-16rem)]"
                    )}>
                        <div
                            className={"cursor-pointer w-24 flex flex-col items-center p-1 border rounded-md hover:shadow space-y-0.5 select-none bg-surface hover:bg-indigo-50 active:bg-indigo-100"}
                            onClick={() => {
                                ratingReview("1").then(r => {})}}
                >
                    <span>Again</span>
                    <Badge variant="outline" className={"min-h-5 min-w-12 border-none"} >{againTime}</Badge>
                </div>
                <div
                    onClick={() => {ratingReview("2").then(r => {})}}
                    className={"cursor-pointer w-24 flex flex-col items-center p-1 border rounded-md hover:shadow space-y-0.5 select-none bg-surface hover:bg-indigo-50 active:bg-indigo-100"}>
                    <span>Hard</span>
                    <Badge variant="outline" className={"min-h-5 min-w-12 border-none"}>{hardTime}</Badge>
                </div>
                <div
                    onClick={() => {ratingReview("3").then(r => {})}}
                    className={"cursor-pointer w-24 flex flex-col items-center p-1 border rounded-md hover:shadow space-y-0.5 select-none bg-surface hover:bg-indigo-50 active:bg-indigo-100"}>
                    <span>Good</span>
                    <Badge variant="outline" className={"min-h-5 min-w-12 border-none"}>{goodTime}</Badge>
                </div>
                <div
                    onClick={() => {ratingReview("4").then(r => {})}}
                    className={"cursor-pointer w-24 flex flex-col items-center p-1 border rounded-md hover:shadow space-y-0.5 select-none bg-surface hover:bg-indigo-50 active:bg-indigo-100"}>
                    <span>Easy</span>
                    <Badge variant="outline" className={"min-h-5 min-w-12 border-none"}>{easyTime}</Badge>
                </div>
            </div>}
            </div>}
        </div>
    )
}