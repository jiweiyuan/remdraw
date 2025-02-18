export interface NewScene {
    title: string;
}

export interface SavedFile {
    id: string;
    key?: string;
    dataURL: string;
    mimeType: string;
    created?: number;
    status?: "saved" | "saving" | "error";
}