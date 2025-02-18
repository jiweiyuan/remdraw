import service from "@/lib/request.ts";

export async function createCollection(collection: any) {
    try {
        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/collection`,
            collection,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function listCollections() {
    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/collection`,
        );
        return res.data;
    } catch (error) {
        return error;
    }
}

export async function deleteCollection(id: string) {
    try {
        const res = await service.delete(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/collection/${id}`,
        );
        return res.data;
    } catch (error) {
        return error;
    }
}

export async function renameCollection(collection: any) {
    try {
        const res = await service.put(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/collection/${collection.id}`,
            collection,
        );
        return res.data;
    } catch (error) {
        return error;
    }
}

export async function categorizeScene(collectionID: string, sceneID: string, scene: any) {
    try {
        const res = await service.put(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/collection/${collectionID}/category/${sceneID}`
        );
        return res.data;
    } catch (error) {
        return error;
    }
}