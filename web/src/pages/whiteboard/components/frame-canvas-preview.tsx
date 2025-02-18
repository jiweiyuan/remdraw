import {ExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";
import {BinaryFiles} from "@excalidraw/excalidraw/types/types";
import {useEffect, useState} from "react";
import { exportToCanvas} from "@excalidraw/excalidraw";
import {cn} from "@/lib/utils.ts";
import {useFrameStore} from "@/hooks/useFrameStore.ts";
import {useSceneStore} from "@/hooks/useSceneStore.ts";
import {Skeleton} from "@/components/ui/skeleton.tsx";


export default function FrameCanvasPreview({ id, name, elements, files, selected = false, saved = true}
                                               :{
    id: string,
    name: string,
    elements: ExcalidrawElement[],
    files: BinaryFiles,
    selected?: boolean
    saved?: boolean
}) {
    const [canvasUrl, setCanvasUrl] = useState<string>("");
    const {isSavedOnServer, addFrame, removeFrame} = useSceneStore();
    const toggleSaved = () => {
       const isSaved = isSavedOnServer(id)
        if (isSaved) {
            removeFrame(id)
        } else {
            addFrame(id)
        }
    }

    const {setId, setEventSource} = useFrameStore();

    useEffect(() => {
        exportToCanvas({
            elements: elements,
            files: files,
        }).then((canvas) => {
            setCanvasUrl(canvas.toDataURL());
        });
    }, [elements, files]);

    return (
        <div className={cn(selected ? "border-indigo-200" : "border-gray-100",
            "relative flex bg-transparent border-2 h-48 m-2 rounded-lg cursor-pointer hover:border-indigo-200")}
             onClick={() => {
                 setId(id);
                 setEventSource("sidebar");
             }}
        >
            {canvasUrl
                ? <img src={canvasUrl} alt={id} className="w-full h-full object-contain"/>
                : <Skeleton className="w-full h-full object-contain bg-gray-50"/>
            }
                <div className={cn("absolute top-1 right-1 h-4 w-4 m-1", "bg-white text-black")} onClick={(e) => {
                e.stopPropagation()
                toggleSaved()
            }}>
                <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"
                        className={isSavedOnServer(id) ? "text-amber-300" : "text-indigo-50"}>
                    <path
                        d="M7.22303 0.665992C7.32551 0.419604 7.67454 0.419604 7.77702 0.665992L9.41343 4.60039C9.45663 4.70426 9.55432 4.77523 9.66645 4.78422L13.914 5.12475C14.18 5.14607 14.2878 5.47802 14.0852 5.65162L10.849 8.42374C10.7636 8.49692 10.7263 8.61176 10.7524 8.72118L11.7411 12.866C11.803 13.1256 11.5206 13.3308 11.2929 13.1917L7.6564 10.9705C7.5604 10.9119 7.43965 10.9119 7.34365 10.9705L3.70718 13.1917C3.47945 13.3308 3.19708 13.1256 3.25899 12.866L4.24769 8.72118C4.2738 8.61176 4.23648 8.49692 4.15105 8.42374L0.914889 5.65162C0.712228 5.47802 0.820086 5.14607 1.08608 5.12475L5.3336 4.78422C5.44573 4.77523 5.54342 4.70426 5.58662 4.60039L7.22303 0.665992Z"
                        fill="currentColor"></path>
                </svg>
            </div>

            <div
                className="absolute bottom-0 flex h-[34px] items-center rounded-b-lg overflow-hidden text-xs font-medium p-2 w-full bg-gray-200/50 backdrop-blur-[3px] dark:bg-neutral-700/50">
                <div>{name}</div>
            </div>
        </div>
    )
}