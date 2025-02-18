import React, {useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";
import {Pencil, Trash2} from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {deleteCollection, renameCollection} from "@/request/collection.ts";

export interface CollectionPreviewProps {
    id: string;
    name: string;
    scene_list: string[];
    onRefresh: () => void;
    onCollectionClick: (id: string) => void;
}

export const CollectionPreview: React.FC<CollectionPreviewProps> = ({ id, name, scene_list, onRefresh, onCollectionClick } : CollectionPreviewProps) => {

    const [newName, setNewName] = useState(name);
    const [isPopOverOpen, setIsPopOverOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

    const onRename = async () => {
        const data = await renameCollection({id: id, name: newName})
        if (data) {
            setIsDialogOpen(false)
            onRefresh()
        }
    }

    const onDelete = async () => {
        const data = await deleteCollection(id)
        if (data) {
            setIsDialogOpen(false)
            onRefresh()
        }
    }

    return (
        <div className="flex flex-col cursor-pointer" onClick={() => {onCollectionClick(id)}}>
            <div className="flex">
                <div className="w-44 h-8 bg-gray-100 rounded-tl-xl rounded-tr-xl flex justify-center">
                    <div className="h-2 w-20 bg-indigo-200 rounded-b-lg "></div>
                </div>
                <div className="w-28 h-8 relative bg-gray-100">
                    <div className="absolute bottom-0 left-0 h-8 w-full bg-white rounded-bl-3xl"></div>
                </div>
            </div>
            <div className="h-24 bg-gray-100 rounded-br-xl rounded-bl-xl rounded-tr-xl p-2 shadow-lg relative">
                <Popover open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
                    <div className="absolute right-2 top-2 hover:border-indigo-100 bg-transparent rounded">
                        <div
                            className="cursor-pointer rounded hover:bg-surface-primary-container flex items-center text-on-surface"
                            onClick={e => {
                                e.stopPropagation()
                                e.preventDefault()
                            }}
                        >
                            <PopoverTrigger>
                                <div className="flex h-6 w-6 items-center justify-center hover:bg-surface-high">
                                    <svg
                                        aria-hidden="true"
                                        focusable="false"
                                        role="img"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        style={{flex: '0 0 auto'}}
                                    >
                                        <path
                                            d="M7.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM13.75 12a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0ZM18 13.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z"
                                            fill="currentColor"
                                        ></path>
                                    </svg>
                                </div>
                            </PopoverTrigger>
                        </div>
                    </div>
                    <PopoverContent
                        align={"end"}
                        className={"group w-24 p-0 border-transparent space-y-1 shadow-none bg-transparent"}>

                        <Button className="w-full flex items-center justify-start" size={"sm"} variant={"outline"}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    setIsDialogOpen(true)
                                }}>
                            <Pencil size={12}/>
                            <span className={"ml-2"}>Rename</span>
                        </Button>

                        <Button className="w-full flex items-center justify-start" size={"sm"} variant={"outline"}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    setIsAlertDialogOpen(true)
                                }}
                        >
                            <Trash2 size={12}/>
                            <span className={"ml-2"}>Delete</span>
                        </Button>
                    </PopoverContent>
                </Popover>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Rename</DialogTitle>
                            <DialogDescription>
                                Rename your scene here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" value={newName} className="col-span-3"
                                   onChange={(e) => setNewName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={onRename}>
                                {'Save'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure to delete {name} ?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                scene from the server!
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className={"bg-red-500 hover:bg-red-600"}
                                               onClick={onDelete}
                            >Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="truncate text-lg text-gray-900 select-none" title={name}>
                    {name}
                </div>
                <div className="absolute right-2 bottom-2 select-none text-sm">
                    {scene_list?.length || 0} scenes
                </div>
            </div>
        </div>
    )
}