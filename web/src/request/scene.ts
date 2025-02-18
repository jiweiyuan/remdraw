import axios from "axios";
import service from "@/lib/request.ts";
import {SavedFile} from "@/schema/scene.ts";
import {openDB} from "idb";
import diff from "microdiff";
import SceneCache from "@/lib/scenecache.ts";
import {findCreatedFrames, findDeletedFrames} from "@/lib/frame.ts";

export async function listScenes() {
    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function getSceneById(id: string) {

    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${id}`,
        );
        if (res.data?.version && res.data.id) {
            SceneCache.of(res.data.id).set({
                version: res.data.version,
                elements: res.data.elements,
                app_state: res.data.app_state,
            });
        }
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function createScene(scene: any) {
    try {
        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene`,
            scene,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function updateScene(scene: any) {
    if (!scene.id) {
        return;
    }

    // This is very important, if there is no elements, we should not update the scene
    // This will fix the bug the application might accidentally update the scene
    if (!scene.elements || scene.elements.length === 0) {
        return {error: 'No elements to update'};
    }

    const {elements, version, appState} = SceneCache.of(scene.id).get();
    if (version) {
        scene.version = Number(version);
    }

    const elementsDelta = diff(elements, scene.elements);
    const createdFrames = findCreatedFrames(elementsDelta);
    console.log('Created frames', createdFrames);
    const deletedFrames = findDeletedFrames(elementsDelta);
    console.log('Deleted frames', deletedFrames);

    const appStateDelta = diff(appState, scene.app_state);
    if (elementsDelta.length === 0 && appStateDelta.length === 0) {
        console.log('No changes detected.');
        return;
    }
    scene.created_frames = createdFrames;
    scene.deleted_frames = deletedFrames;

    try {
        const res = await service.put(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${scene.id}`,
            scene,
        );
        if (res?.data?.version) {
            console.log("update version", res.data.version);
            SceneCache.of(scene.id).set({
                version: res.data.version,
                elements: scene.elements,
                app_state: scene.app_state
            });
        }
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function uploadSceneFile(sceneId: number, file: SavedFile) {
    try {
        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${sceneId}/file`,
            file,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function deleteScene(id: string) {
    try {
        const res = await service.delete(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${id}`,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function getSceneFile(key: string) {
    try {
        const res = await axios.get(
            `${import.meta.env.VITE_REMDRAW_FILE_PREFIX}/${key}`,
            {
                headers: {
                    "Content-Type": "text/plain",
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}



async function getDb() {
    return openDB('scene-cover-db', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('covers')) {
                db.createObjectStore('covers');
            }
        },
    });
}

export async function uploadSceneCover(sceneId: string, data: Blob) {
    try {
        const db = await getDb();
        await db.put('covers', data, sceneId);

        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${sceneId}/cover`,
            data,
            {
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function downloadSceneCover(sceneId: string): Promise<string> {
    try {
        const db = await getDb();
        const cached = await db.get('covers', sceneId);

        if (cached) {
            console.log('cache hit ' + sceneId);
            return URL.createObjectURL(cached);
        }

        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${sceneId}/cover`,
            {
                responseType: 'blob',
            }
        );

        await db.put('covers', res.data, sceneId);

        return URL.createObjectURL(res.data);
    } catch (error) {
        console.error(error);
        return 'https://user-images.githubusercontent.com/23306911/71765346-d3966180-2ef3-11ea-8092-356daf4cbc6b.png';
    }
}

export async function renameScene(sceneId: string, name: string) {
    try {
        const request = { id : sceneId, name };
        const res = await service.put(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${sceneId}/rename`,
            request
        );
        
        return res.data;
    } catch (error) {
        console.error('Failed to rename scene:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to rename scene');
    }
}