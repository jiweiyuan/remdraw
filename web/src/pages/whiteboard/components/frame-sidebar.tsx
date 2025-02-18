import {useFrameStore} from "@/hooks/useFrameStore.ts";
import {useEffect, useRef, useState} from "react";
import {BinaryFiles} from "@excalidraw/excalidraw/types/types";
import {ExcalidrawElement, ExcalidrawFrameElement} from "@excalidraw/excalidraw/types/element/types";
import FrameCanvasPreview from "@/pages/whiteboard/components/frame-canvas-preview.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";


interface CanvasPreview {
    elements: ExcalidrawElement[];
    files: BinaryFiles;
    id: string;
    name: string;
}

export default function FrameSidebar({elements, files} : {elements: ExcalidrawElement[], files: BinaryFiles|undefined}) {

    const { id } = useFrameStore();
    const [frames, setFrames] = useState<CanvasPreview[]>([])
    const viewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const frameIds = elements
            .filter((element) => element.type === "frame")
            .sort((a, b) =>  a.y - b.y || b.x - a.x) // sort by y and x, need to be changed suitable more flexible layout
            .map((element) => element.id)
        const frames = frameIds.map((frameId, index) => {
            const elementsInFrame = elements.filter((element) => element.frameId === frameId)
            const frameElement = elements.find((element) => element.id === frameId)
            return {
                id: frameId,
                name: (frameElement as ExcalidrawFrameElement).name ?? `Frame ${index + 1}`,
                elements: elementsInFrame,
                files: files ?? {}
            }
        })
        setFrames(frames)
    }, [elements, files])

    useEffect(() => {
        const index = elements
            .filter((element) => element.type === "frame")
            .findIndex((element) => element.id === id)
        if (id && viewportRef?.current) {
            viewportRef.current.scrollTo({
                top: 198 * index + 10,
                behavior: "smooth"
            })
        }
    }, [id]);
    return (
        <div className="flex flex-col justify-between h-full w-full">
            <ScrollArea className="w-full"
                        viewportRef={viewportRef}
            >
                <div className={"rounded-none border-none shadow-none my-2"}>
                    {frames.map((frame) => {
                        return <FrameCanvasPreview elements={frame.elements} files={frame.files} id={frame.id} name={frame.name} key={frame.id} selected={frame.id === id}/>
                    })}
                </div>
            </ScrollArea>
            <div className="flex items-center space-x-2 min-h-12 bg-gray-100 pl-2">
                {/*<Switch id="airplane-mode" checked={presentationMode} onCheckedChange={handleSwitchChange}/>*/}
                {/*<Label htmlFor="airplane-mode">Presentention Mode</Label>*/}
            </div>
        </div>
    )

}