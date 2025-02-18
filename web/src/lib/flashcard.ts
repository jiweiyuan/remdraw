import {ExcalidrawElement, NonDeletedExcalidrawElement} from "@excalidraw/excalidraw/types/element/types";

export const isFlashcard = (elements: NonDeletedExcalidrawElement[]) => {
    return elements.some((element) =>{
        return element?.customData?.display === "front" || element?.customData?.display === "back"
    })
}

export const extractElements = (elements: readonly NonDeletedExcalidrawElement[] | undefined, type: "front" | "back") => {
    return elements?.map((element: ExcalidrawElement) => {
        let opacity = element.opacity;

        if (type === "front") {
            if (element.customData?.display === "front") {
                opacity = 100;
            } else if (element.customData?.display === "back") {
                opacity = 0;
            } else if (element.customData?.display) {
                opacity = 100;
            }
        } else if (type === "back") {
            if (element.customData?.display === "front") {
                opacity = 0;
            } else if (element.customData?.display === "back") {
                opacity = 100;
            } else if (element.customData?.display) {
                opacity = 100;
            }
        }

        return {
            ...element,
            opacity
        };
    });
};
