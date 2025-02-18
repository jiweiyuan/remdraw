import axios from "axios";
export async function login(data: any) {
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_REMDRAW_API_PREFIX}/v1/login`,
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );
        return res.data;
    } catch (error) {
        console.log(error);
        return {success: false}
    }
}