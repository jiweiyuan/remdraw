import {
    DefaultSidebar,
    Excalidraw, exportToBlob,
    Sidebar,
    useHandleLibrary
} from "@excalidraw/excalidraw";
import {useTheme} from "@/providers/theme-provider.tsx";
import FrameSidebar from "@/pages/whiteboard/components/frame-sidebar.tsx";
import {useEffect, useState} from "react";
import {Monitor, Layers2} from "lucide-react";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Separator} from "@/components/ui/separator";
import {useCallbackRefState} from "@/hooks/useCallbackRefState.ts";
import {
    AppState,
    BinaryFileData,
    BinaryFiles,
    ExcalidrawImperativeAPI,
    PointerDownState
} from "@excalidraw/excalidraw/types/types";
import {useParams} from "react-router-dom";
import {
    getSceneById,
    getSceneFile,
    updateScene,
    uploadSceneCover,
    uploadSceneFile
} from "@/request/scene.ts";
import Title from "./components/title";
import {EVENT} from "@/constants.ts";
import { _ } from "lodash";
import {SavedFile} from "@/schema/scene.ts";
import {useFrameStore} from "@/hooks/useFrameStore.ts";
import {ExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";
import {useSceneStore} from "@/hooks/useSceneStore.ts";
import LeftSidebarControl from "@/components/shared/left-sidebar-control.tsx";
import {addMathButton, removeLibraryTrigger} from "@/lib/excalidraw.ts";
import { RightSidebarControl } from "@/components/shared/right-sidebar-control";
import { cn } from "@/lib/utils";
import ComponentSidebar from "@/pages/whiteboard/components/component-sidebar.tsx";
import {useElementStore} from "@/hooks/useElementStore.ts";
import {SceneSiderbar} from "@/pages/whiteboard/components/scene-siderbar.tsx";
import SceneCache from "@/lib/scenecache.ts";


export default function Whiteboard() {
    const { theme, toggleLeftSidebar } = useTheme();
    const {setSceneId, sceneDisplay} = useSceneStore();
    const {elementId, setElementId} = useElementStore();
    const {elementDisplay, setElementDisplay} = useElementStore();
    const [toggledRight, setToggledRight] = useState(true);
    const {sceneId: path} = useParams<{sceneId: string}>();
    const [scene, setScene] = useState<any>({
        id: path,
        version: 0,
        name: "",
        elements: [],
        appState: {}
    });

    const [savedFiles, setSavedFiles] = useState<SavedFile[]>([]);
    const [excalidrawAPI, excalidrawRefCallback] = useCallbackRefState<ExcalidrawImperativeAPI | null>();
    const { id: frameId, presentationMode, eventSource: frameSelectionSource, setId, setEventSource, setElements } = useFrameStore();

    useHandleLibrary({ excalidrawAPI });
    const toggleSidebar = () => {
        setToggledRight(!toggledRight);
        excalidrawAPI?.toggleSidebar({name: "custom"});
    }

    const handlePointerDown = (
        activeTool: AppState["activeTool"],
        pointerDownState: PointerDownState,
    ) => {
        if(activeTool?.type === "selection" && pointerDownState?.hit?.element?.type === "frame") {
            const frameId = pointerDownState.hit.element.id;

            if (excalidrawAPI?.getAppState()?.openSidebar) {
                setId(frameId);
                setEventSource("whiteboard");
                setElements((excalidrawAPI?.getSceneElements() || [])
                    .filter((element) => element.frameId === frameId));
            }
        } else if (activeTool?.type === "selection"&& pointerDownState?.hit?.element?.id) {
            const elementId = pointerDownState.hit.element.id;
            setElementId(elementId);
            if (pointerDownState?.hit?.element?.customData?.display) {
                setElementDisplay(pointerDownState?.hit?.element?.customData?.display);
            }
        } else {
            setElementId("");
            setElementDisplay("all");
        }
    };

    const debounceSyncSceneFiles = _.debounce((files: BinaryFiles) => {
        const unsavedFiles: BinaryFileData[] = [];
        for (const [key] of Object.entries(files)) {
            if (savedFiles.every((f) => f.id !== key)) {
                unsavedFiles.push(files[key]);
            }
        }

        for (const file of unsavedFiles) {
            setSavedFiles([...savedFiles, file as SavedFile]);
            uploadSceneFile(scene.id, {
                id: file.id,
                dataURL: file.dataURL,
                mimeType: file.mimeType,
            }).then((data) => {
                console.log("saved file", data)
            }).catch(() => {
                setSavedFiles(savedFiles.filter((f) => f.id !== file.id));
            })
        }
    }, 2000);


    const saveScene = async (elements: readonly ExcalidrawElement[], appState: AppState) => {
        if (!excalidrawAPI || !scene.name) { return; }

        let elementsData = excalidrawAPI?.getSceneElements();
        let appStateData = excalidrawAPI?.getAppState();

        // This to prevent the scene from being saved when the scene is empty
        //
        if (!elementsData || elementsData.length === 0) {
            return;
        }

        try {
           await updateScene( {id: scene.id, elements: elementsData, app_state: appStateData, version: scene.version});

        } catch (e) {
            console.log("failed to save scene", e)
        }

        const blob = await exportToBlob({
            elements: elements,
            files: excalidrawAPI?.getFiles() || null,
            maxWidthOrHeight: 500
        });
        try {
            await uploadSceneCover(scene.id, blob)
        } catch (e) {
            console.log("failed to save scene cover", e)
        }

    }

    const debounceSaveFile = _.debounce(saveScene, 1000);
    const onSceneChange = (elements: readonly ExcalidrawElement[],
                          appState: AppState,
                          files: BinaryFiles,
    ) => {
        if (!excalidrawAPI || scene.version == 0) {
            return;
        }
        debounceSyncSceneFiles(files);
        debounceSaveFile(elements, appState);
    }

    const fetchSceneFiles = async (files: SavedFile[]) => {
        // Create an array of promises by mapping over savedFiles
        const excalidrawFiles: BinaryFileData[] = [];
        const promises = files.map(async (file) => {
            if (!file.key) return;
            const data = await getSceneFile(file.key);
            if (!data) return;
            excalidrawFiles.push({
                id: file.id,
                dataURL: data,
                mimeType: file.mimeType,
                created: file.created
            } as BinaryFileData);
        });

        // Wait for all promises to resolve
        await Promise.all(promises);
        excalidrawAPI?.addFiles(excalidrawFiles);
        setSavedFiles(excalidrawFiles.map((file) => {
            return {
                id: file.id,
                dataURL: file.dataURL,
                mimeType: file.mimeType,
                created: file.created,
                status: "saved"
            } as SavedFile
        }));
    };

    const fetchScene = async () => {
        const data =  await getSceneById(scene.id);
        setScene((prev: any) => ({
            ...prev,
            id: data.id,
            name: data.name,
            version: data.version,
            elements: data.elements,
            appState: data.app_state
        }));

        setSceneId(data.id);
        const files = data.files?.map((file: { id: string, oss_key: string, mimeType: string, create_ts:string }) => {
            return {
                id: file.id,
                key: file.oss_key,
                dataURL: "",
                mimeType: file.mimeType,
                created: new Date(file.create_ts).getTime(),
                status: "saved"
            } as SavedFile
        }) || [];

        setSavedFiles(files);
        fetchSceneFiles(files).then(() => {
            console.log("all scene file has been fetched")
        })
        if (!data) return;
        // set preview all
        data.elements = data.elements.map((element: ExcalidrawElement) => {
            let opacity = element.opacity;
            if (element.customData?.display) {
                opacity = 100;
            }
            return {
                ...element,
                opacity: opacity
            }
        })

        if (data.elements && data.elements.length !== 0) {
            excalidrawAPI?.updateScene({
                elements: data.elements,
                appState: {...data.app_state, collaborators: []}
            })
        }
    }

    useEffect(() => {
        if (!excalidrawAPI) {
            return
        }
        toggleLeftSidebar();
        if (presentationMode) {
            excalidrawAPI.updateScene({
                appState: {
                    zenModeEnabled: true,
                    viewModeEnabled: true,
                },
            });
        } else {
            excalidrawAPI.updateScene({
                appState: {
                    zenModeEnabled: false,
                    viewModeEnabled: false,
                },
            });
        }

    }, [presentationMode]);

    useEffect(() => {
        const frame = excalidrawAPI?.getSceneElements().find((element) => element.id === frameId);

        const newFrame = {
            ...frame,
            x : frame?.x ?  frame.x + 292 : 0,
            width : frame?.width ? frame.width - 292: 0,
        }
        frameSelectionSource == "sidebar" && excalidrawAPI?.scrollToContent(newFrame as ExcalidrawElement, {
            fitToViewport: true,
            animate: true,
        });

    }, [frameId]);

    useEffect(() => {
        if (!elementId || !elementDisplay) return;
        const elements = excalidrawAPI?.getSceneElements();
        if (!elements) return;
        const element = elements.find((element) => element.id === elementId);
        if (!element) return;
        let customData = {display: elementDisplay};
        excalidrawAPI?.updateScene({elements: elements.map((e) => {
                if (e.id === elementId) {
                    return {
                        ...e,
                        customData
                    }
                }
                return e;
            })
        })
        console.log("element new is ", excalidrawAPI?.getSceneElements().find((element) => element.id === elementId))

    }, [elementId, elementDisplay]);

    useEffect(() => {
        console.log("need to update element display")
        let elements = excalidrawAPI?.getSceneElements();
        excalidrawAPI?.updateScene({
            elements: elements?.map((element: ExcalidrawElement) => {
                let opacity = element.opacity;
                if (sceneDisplay === "front" && element.customData?.display === "front") {
                    opacity = 100;
                } else if (sceneDisplay === "back" && element.customData?.display === "back") {
                    opacity = 100;
                } else if (sceneDisplay === "front" && element.customData?.display === "back") {
                    opacity = 0;
                } else if (sceneDisplay === "back" && element.customData?.display === "front") {
                    opacity = 0;
                } else if (sceneDisplay === "all" && element.customData?.display) {
                    opacity = 100;
                }
                return {
                    ...element,
                    opacity
                }
            })
        })

    }, [sceneDisplay, elementDisplay]);

    useEffect(() => {
        if (!excalidrawAPI) {
            return
        }
        fetchScene().then(() => {})
        const visibilityChange = (event: FocusEvent | Event) => {
            //
        };

        window.addEventListener(EVENT.BLUR, visibilityChange, false);
        document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
        window.addEventListener(EVENT.FOCUS, visibilityChange, false);

        const trigger = document.querySelector(".App-toolbar__extra-tools-trigger");
        trigger?.addEventListener("click", addMathButton);
        removeLibraryTrigger();

        return () => {
            window.removeEventListener(EVENT.BLUR, visibilityChange);
            document.removeEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange);
            window.removeEventListener(EVENT.FOCUS, visibilityChange);


            SceneCache.of(scene.id).clear();
        }
    }, [excalidrawAPI]);
    // @ts-ignore
    return <div className="w-full h-full absolute remdraw">
        <div className={"absolute top-4 left-28 2xl:w-64 xl:w-24 h-9 leading-9 dark:bg-default flex items-center"}
             style={{zIndex: 20}}>
            <Title id={scene.id} value={scene.name}/>
        </div>

        <div className="absolute top-4 left-4 excalidraw-tooltip-wrapper z-10">
            <LeftSidebarControl/>
        </div>

        <div className={cn("absolute top-4 right-4 excalidraw-tooltip-wrapper z-10")}>
            <RightSidebarControl onClick={toggleSidebar} open={toggledRight}/>
        </div>
        <Excalidraw
            excalidrawAPI={excalidrawRefCallback}
            theme={theme === "system" ?
                window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
                : theme}
            initialData={{
                appState: {zenModeEnabled: false},
                scrollToContent: true
            }}
            UIOptions={{
                // this effectively makes the sidebar dockable on any screen size,
                // ignoring if it fits or not
                dockedSidebarBreakpoint: 0,
            }}
            onChange={(elements, state, files) => {
                onSceneChange(elements, state, files);
            }}
            onPointerDown={handlePointerDown}
        >
            <DefaultSidebar.Trigger style={{display: "none"}}/>
            <Sidebar name="custom" docked={true}>
                <Tabs defaultValue="frame" className="w-full h-full">
                    <div className="w-24 mt-4 ml-2 pb-2 border-red-400">
                        <TabsList className="grid w-full grid-cols-2 py-1">
                            {/*<TabsTrigger value="scene">Scene</TabsTrigger>*/}
                            <TabsTrigger value="frame"
                                         className={"active:bg-red-300 py-1.5"}
                            ><Monitor size={16} /></TabsTrigger>
                            <TabsTrigger value="element"  className={"active:bg-red-300 py-1.5"}
                            ><Layers2 size={16}/></TabsTrigger>
                        </TabsList>
                    </div>
                    <Separator className="my-1" />

                    <TabsContent value="scene">
                        <SceneSiderbar sceneId={scene.id}/>
                    </TabsContent>
                    <TabsContent value="frame" className={"h-full pb-12"}>
                        <FrameSidebar
                            elements={(excalidrawAPI?.getSceneElements() || []) as ExcalidrawElement[]}
                            files={excalidrawAPI?.getFiles()}
                        ></FrameSidebar>
                    </TabsContent>
                    <TabsContent value="element">
                        <ComponentSidebar/>
                    </TabsContent>
                </Tabs>
            </Sidebar>
        </Excalidraw>
    </div>;
}