import {PanelLeft} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useTheme} from "@/providers/theme-provider";

export default function LeftSidebarControl() {
    const {toggleLeftSidebar} = useTheme();
    return (
        <Button className="w-9 bg-surface hover:bg-surfacehover text-black shadow-none"

                onClick={() =>
                    toggleLeftSidebar()}>
            <div className="ToolIcon__icon" aria-hidden="true">
                <PanelLeft className="h-4 w-4" strokeWidth={1.25} stroke="currentColor"
                />
            </div>
        </Button>
    )
}