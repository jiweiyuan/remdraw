import {PanelRight, X} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";

interface Props {
    onClick: () => void
    open?: boolean
}

export function RightSidebarControl(
    {onClick, open = false}: Props
) {
    return (
        <Button className="w-9 bg-surface hover:bg-surfacehover text-black shadow-none"
                onClick={() => onClick()}>
            <div className="ToolIcon__icon" aria-hidden="true">
                {
                    open
                        ? <X  className="h-4 w-4 transform rotate-180" strokeWidth={1.25} stroke="currentColor"/>
                        : <PanelRight className="h-4 w-4 transform rotate-180" strokeWidth={1.25} stroke="currentColor"/>
                }
            </div>
        </Button>
    )
}
