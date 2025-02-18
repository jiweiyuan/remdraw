import React, {useEffect, useState} from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {Button} from "@/components/ui/button.tsx";
import {Pencil, Trash2} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog.tsx";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {deleteScene, downloadSceneCover, updateScene, renameScene} from "@/request/scene.ts";

export interface ScenePreviewProps {
    id: string;
    href: string;
    imgUrl: string;
    name: string;
    author: string;
    updated: string;
    onRefresh: () => void;
}
export const ScenePreview: React.FC<ScenePreviewProps> = ({ id, href, name, author, updated , onRefresh}) => {
    const [newName, setNewName] = useState(name);
    const [isPopOverOpen, setIsPopOverOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
    const [imgUrl, setImgUrl] = useState(`https://user-images.githubusercontent.com/23306911/71765346-d3966180-2ef3-11ea-8092-356daf4cbc6b.png`);
    useEffect(() => {
       downloadSceneCover(id)
           .then((url: string) => {
                if (url) setImgUrl(url)
            })
    }, []);
    
    const onRename = async () => {
        console.log(id, newName)
        const data = await renameScene(id, newName)
        console.log(data)
        if (data) {
            setIsDialogOpen(false)
            onRefresh()
        }
    }

    const onDelete = async () => {
        const data = await deleteScene(id)
        if (data) {
            setIsDialogOpen(false)
            onRefresh()
        }
    }
    const handleMouseLeave = () => {
        setIsPopOverOpen(false)
    }
    return (
      <a
          className="group w-full relative flex flex-col overflow-hidden rounded-xl shadow-xl border-2  border-transparent  hover:border-indigo-100 active:border-primary-darkest"
          draggable="false"
          href={href}
          onMouseLeave={handleMouseLeave}
      >
      <span data-state="closed" className="contents bg-transparent select-none">
        <div className="relative flex w-full bg-transparent">
          <div className="flex aspect-[4/3] w-full flex-shrink-0 items-center justify-center bg-transparent  select-none">
            <img
                className="flex h-[140px] max-w-[140px] px-3 pb-9 pt-3 sm:h-[145px] sm:max-w-[192px]  sm:px-2 sm:pb-2 sm:pt-2 pointer-events-none relative w-full object-contain"
                src={imgUrl}
                alt={name}
            />
          </div>
        </div>
        <div className="mt-1.5 shadow px-2 pb-1 pt-1 xl:mt-2 bg-gray-100  select-none">
          <div className="truncate text-sm font-semibold text-gray-900" title={name}>
            {name}
          </div>
          <div className="flex justify-between gap-2  select-none">
            <div className="truncate text-[12px]" style={{maxWidth: '80px'}}>
                {/*by {author}*/}
              </div>
                <div
                    className="rounded p-[2px] px-2 text-[12px] text-gray-700 dark:bg-default select-none"
                    title={`Updated ${updated}`}
                >
                    {updated}
                </div>
          </div>
        </div>
        <Popover open={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
            <div className="invisible absolute right-2 top-2 group-hover:visible hover:bg-indigo-100 rounded">
          <div>
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
        </div>
        <PopoverContent
            align={"end"}
            className={"group w-24 p-0 border-transparent space-y-1 shadow-none"}>
            <Button className="w-full flex items-center justify-start" size={"sm"} variant={"outline"}
                    onClick={() => {
                        setIsDialogOpen(true)
                    }}
            >
                    <Pencil size={12}/>
                    <span className={"ml-2"}>Rename</span>
                </Button>
            <Button className="w-full flex items-center justify-start" size={"sm"} variant={"outline"}
                    onClick={() => {
                        setIsAlertDialogOpen(true)
                    }}
            >
                        <Trash2 size={12} />
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
      </span>
      </a>
  );
}
