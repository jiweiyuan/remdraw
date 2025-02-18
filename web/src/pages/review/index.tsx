import {Button} from "@/components/ui/button.tsx";
import PageHead from "@/components/shared/page-head.tsx";
import {WalletCards} from "lucide-react";
import {useEffect} from "react";
import {useReviewStore} from "@/hooks/useReviewStore.ts";
import {useNavigate} from "react-router-dom";

export default function Review() {
    const navigate = useNavigate();
    const routeToFrameReview = () => {
        // window.location.href = "/review/frame"
        navigate('/review/frame')
    }

    const { count } = useReviewStore();
    const prefetchFrame = useReviewStore(state => state.prefetchFrame);
    const listTodayReviews = useReviewStore(state => state.listTodayReviews);
    const getCurrentReviews = useReviewStore(state => state.getCurrentReview)

    useEffect( () => {
        listTodayReviews()
    }, []);

    useEffect(() => {
        const frameId = getCurrentReviews()
        if (!frameId) return
        prefetchFrame(frameId)
    }, [count]);
    return (
        <>
            <PageHead title="Review | Remdraw" />
            <div className="flex-1 space-y-4 p-2 pt-2 md:p-4">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Review
                    </h2>
                    <div>
                        <Button className={"text-sm bg-surface hover:bg-indigo-100 text-gray-700"}
                                onClick={routeToFrameReview}
                        >
                            <WalletCards size={16} className={"mr-2"} />
                            Practice Today's Frame {count}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}