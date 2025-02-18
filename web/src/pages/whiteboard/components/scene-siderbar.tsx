import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {categorizeScene, listCollections} from "@/request/collection.ts";
import {useEffect, useState} from "react";
import {CollectionPreviewProps} from "@/pages/dashboard/components/collection-preview.tsx";

export interface SceneSiderbarProps {
    sceneId: string;
}

export function SceneSiderbar(
    { sceneId }: SceneSiderbarProps
) {
    const [collections, setCollections] = useState<CollectionPreviewProps[]>([])

    const [collectionName, setCollectionName] = useState("")
    const fetchCollections = async () => {
        const data = await listCollections()
        const collections = data?.collections || []
        const collection = collections.find((collection: { scene_list: string[] }) => collection?.scene_list?.includes(sceneId))
        if (collection) {
            setCollectionName(collection.name)
        }
        setCollections(collections)
    }

    useEffect(() => {
        fetchCollections().then(() => {})
    }, []);

    const catagoryCollection = (value: string) => {
        const collection = collections
            .find((collection) => collection.name === value)
        if (!collection) {
            return
        }
        categorizeScene(collection.id, sceneId, {collection: value}).then((data) => {
            setCollectionName(value)
        })
    }

    return (
        <div>
            <div className="px-2 space-y-2">
                <h4 className="text-sm font-semibold">Collection</h4>
                <Select value={collectionName} onValueChange={catagoryCollection}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Assign Collection"/>
                    </SelectTrigger>
                    <SelectContent>
                        {collections.map((collection) => (
                            <SelectItem key={collection.id} value={collection.name}>
                                {collection.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}