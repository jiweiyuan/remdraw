import PageHead from '@/components/shared/page-head.jsx';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs.js';
import {Button} from "@/components/ui/button.tsx";
import {ChevronRight, FolderOpen, SquarePen} from "lucide-react";
import {ScenePreview, ScenePreviewProps} from "@/pages/dashboard/components/scene-preview.tsx";
import {formatDateString, timeSince} from "@/lib/time.ts";
import {createScene, listScenes} from "@/request/scene.ts";
import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";

import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {createCollection, listCollections} from "@/request/collection.ts";
import {CollectionPreview, CollectionPreviewProps} from "@/pages/dashboard/components/collection-preview.tsx";

export default function DashboardPage() {
  const [scenes, setScenes] = useState<ScenePreviewProps[]>([])
  const [collections, setCollections] = useState<CollectionPreviewProps[]>([])
  const [singleCollection, setSingleCollection] = useState(false)
  const [collectionScenes, setCollectionScenes] = useState<ScenePreviewProps[]>([])
  const [collection, setCollection] = useState({id: "", name: "", scene_list: [""]})
  const [display, setDisplay] = useState("scenes")
  const [collectionName, setCollectionName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const handleCollectionNameChange = (value: string) => {
        setCollectionName(value)
  }

  const handleDisplayChange = (value: string) => {
      setDisplay(value)
  }

  const onCreateScene = async () => {
    const newScene = {
      name: "Untitled Scene " + formatDateString(new Date()),
    }
    const data = await createScene(newScene)
    if (data?.id) {
        window.location.href = `/scene/${data.id}`
    }
    console.log("create new scene", data)
  }

  const onCreateCollection = async () => {
      const collection = {
        name: collectionName
      }

      let data = await createCollection(collection)
      if (data?.collection) {
        setIsDialogOpen(false)
        await fetchCollections()
      }
  }

  const fetchScenes = async () => {
    const data  = await listScenes()
    const scenes = data?.scenes
        ?.sort((a: { update_ts: string; }, b: { update_ts: string; }) => new Date(b.update_ts).getTime() - new Date(a.update_ts).getTime())
        .map((scene: { id: string;  cover_etag: string, name: any; update_ts: string; author: any; }) => {
          return {
            id: scene.id,
            href: `/scene/${scene.id}`,
            etag: scene.cover_etag,
            imgAlt: scene.name,
            updated: timeSince(scene.update_ts),
            name: scene.name,
            author: scene.author,
            onRefresh: fetchScenes
          }});

    setScenes(scenes)
  }

  const fetchCollections = async () => {
    const data = await listCollections()
    const collections = data?.collections
        ?.sort((a: { update_ts: string; }, b: { update_ts: string; }) => new Date(b.update_ts).getTime() - new Date(a.update_ts).getTime())
        .map((collection: { id: any; name: any; update_ts: string; scene_list: any}) => {
          return {
            id: collection.id,
            name: collection.name,
            scene_list: collection.scene_list,
            updated: timeSince(collection.update_ts),
          }});

    setCollections(collections)
  }

  const onCollectionClick = (id: string) => {
      setSingleCollection(true)
        const collection = collections.find((collection) => collection.id === id)
        if (collection) {
            setCollection(collection)
            const collectionScenes = scenes.filter((scene) => collection.scene_list?.includes(scene.id))
            setCollectionScenes(collectionScenes)
        }
  }

  useEffect(() => {
    fetchScenes().then()
    fetchCollections().then()
  }, [])

  return (
    <>
      <PageHead title="Dashboard | Remdraw" />
      <div className="flex-1 space-y-4 p-2 pt-2 md:p-4">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center space-x-4">
            { display === "scenes"
                ? <Button className={"text-sm bg-surface hover:bg-indigo-100 text-gray-700 w-44"}
                          onClick={onCreateScene}
                  >
                    <SquarePen className={"pr-2"}/>
                    New Scene
                  </Button>
                :
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className={"text-sm bg-surface hover:bg-indigo-100 text-gray-700 w-44"}
                >
                  <FolderOpen className={"pr-2"}/>
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>Click save when you're done.
              </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Name
                </Label>
                <Input id="name" value={collectionName}
                       onChange={(e) => handleCollectionNameChange(e.target.value)}
                       className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
              <Button onClick={onCreateCollection}>Save</Button>
              </DialogFooter>
              </DialogContent>
              </Dialog>
            }
          </div>

        </div>
        <Tabs className="space-y-4" defaultValue="scenes" onValueChange={handleDisplayChange} value={display}>
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="scenes">Scenes</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>
            {display === "collections" ?
                <div className={"flex items-center space-x-2 px-2"}>
                  <Button variant={"ghost"} className={"text-sm rounded-full text-gray-800"}
                    onClick={() => setSingleCollection(false)}
                >All</Button>
                  {singleCollection && <ChevronRight className={"pr-2"}/> }
                  {singleCollection && <div className={"truncate"}>{collection.name}</div>}
                </div>: null}
          </div>
          <TabsContent value="scenes" className="space-y-4">

            <div
                className="grid gap-6 xs:gap-12 grid-cols-[repeat(auto-fill,_minmax(165px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(210px,_1fr))] mt-6">
              {scenes?.map((scene: ScenePreviewProps) => (
                  <ScenePreview {...scene} key={scene.id}/>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="collections" className="space-y-4">
            {
              singleCollection
                  ?
                    <div
                        className="grid gap-6 xs:gap-12 grid-cols-[repeat(auto-fill,_minmax(165px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(210px,_1fr))] mt-6">
                      {collectionScenes.map((scene: ScenePreviewProps) => (
                          <ScenePreview {...scene} key={scene.id}/>
                      ))}
                    </div>
                  : <div
                      className="grid gap-6 xs:gap-12 grid-cols-[repeat(auto-fill,_minmax(165px,_1fr))] xl:grid-cols-[repeat(auto-fill,_minmax(210px,_1fr))] mt-6">
                    {collections?.map((collection: CollectionPreviewProps) => (
                        <CollectionPreview {...collection} key={collection.id} onRefresh={() => {
                          fetchCollections().then()
                        }}
                           onCollectionClick={onCollectionClick}
                        />
                    ))}
                  </div>
            }
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
