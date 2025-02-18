import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {useElementStore} from "@/hooks/useElementStore.ts";
import {useSceneStore} from "@/hooks/useSceneStore.ts";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group.tsx";
import React from "react";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CaretSortIcon} from "@radix-ui/react-icons";

export default function ComponentSidebar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { setSceneDisplay } = useSceneStore();
    const {elementId, elementDisplay, setElementDisplay} = useElementStore();
    const handleDisplayChange = (value: string) => {
            setElementDisplay(value as "all" | "front" | "back");
    }
    const handleSceneDisplayChange = (value: string) => {
        setSceneDisplay(value as "front" | "back");
    }
    return (<>
        <div className={"rounded-none border-0 shadow-none space-y-2 ml-2"}>
            {elementId ? <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full space-y-2 pr-2"
            >
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">
                        Flashcard Settings
                    </h4>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <CaretSortIcon className="h-4 w-4"/>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <div className={"flex items-center justify-between"}>
                    <span className={"w-24"}>Display:</span>

                    <ToggleGroup type="single" value={elementDisplay}
                                 onValueChange={handleDisplayChange}
                                 className={""}>
                        <ToggleGroupItem value="all" aria-label="Toggle bold">
                            All
                        </ToggleGroupItem>
                        <ToggleGroupItem value="front" aria-label="Toggle italic">
                            Front
                        </ToggleGroupItem>
                        <ToggleGroupItem value="back" aria-label="Toggle strikethrough">
                            Back
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>


                <CollapsibleContent className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className={"w-24"}>Preview:</div>
                        <Tabs defaultValue={"all"} className="" onValueChange={handleSceneDisplayChange}>
                            <TabsList defaultValue={"all"}>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="front">Front</TabsTrigger>
                                <TabsTrigger value="back">Back</TabsTrigger>
                            </TabsList>
                        </Tabs>

                    </div>
                </CollapsibleContent>
            </Collapsible> : ""}
        </div>
    </>)
}