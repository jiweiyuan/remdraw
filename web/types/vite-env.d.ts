/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_REMDRAW_API_PREFIX: string
    readonly VITE_REMDRAW_FILE_PREFIX: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}