import service from "@/lib/request.ts";

export async function createFrame(frame: any) {
    try {
        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${frame.sceneId}/frame`,
            frame,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function deleteFrame(scene_id: string, frame_id: string):Promise<{ success: boolean}> {
    try {
        const res = await service.delete(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${scene_id}/frame/${frame_id}`,
        );
        return res.status === 204 ? { success: true } : { success: false };
    } catch (error) {
        return { success: false };
    }
}

export async function listFrameBySceneID(scene_id: string) {
    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/scene/${scene_id}/frame`,
        );
        return res.data;
    } catch (error) {
        return error;
    }
}
