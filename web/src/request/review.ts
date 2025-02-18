import service from "@/lib/request.ts";

export async function listReviews() {
    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/review`,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function getReviewFrame(frameId : string) {
    try {
        const res = await service.get(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/review/${frameId}`,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function repeatFrame(frameId : string, data: any) {
    try {
        const res = await service.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/review/${frameId}/repeat`,
            data,
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return {success: false}
    }
}