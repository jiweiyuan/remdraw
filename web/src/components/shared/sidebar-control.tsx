import {PanelLeft, PanelRight} from "lucide-react";
import {useTheme} from "@/providers/theme-provider.tsx";

interface SidebarControlProps {
    toggleRightSidebar: () => void
}

export function SidebarControl(
    {toggleRightSidebar}: SidebarControlProps
) {
    const {toggleLeftSidebar} = useTheme();

    return (
        <div className="undo-redo-buttons zen-mode-transition">
            <div className="undo-button-container">
                <div className="excalidraw-tooltip-wrapper">
                    <button className="ToolIcon_type_button ToolIcon_size_medium ToolIcon_type_button--show ToolIcon"
                            aria-label="Undo" type="button"
                            onClick={() =>
                                toggleLeftSidebar()}>
                        <div className="ToolIcon__icon" aria-hidden="true">
                            <PanelLeft className="h-4 w-4" strokeWidth={1.25} stroke="currentColor"
                            />
                        </div>
                    </button>
                </div>
            </div>
            <div className="redo-button-container">
                <div className="excalidraw-tooltip-wrapper">
                    <button className="ToolIcon_type_button ToolIcon_size_medium ToolIcon_type_button--show ToolIcon"
                            aria-label="Redo" type="button" onClick={() => toggleRightSidebar()}>
                        <div className="ToolIcon__icon" aria-hidden="true">
                            <PanelRight className="h-4 w-4" strokeWidth={1.25} stroke="currentColor"
                            />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}