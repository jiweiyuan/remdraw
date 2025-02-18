import {ChangeEvent, useEffect, useState} from "react";
import {Input} from "@/components/ui/input.tsx";
import {renameScene} from "@/request/scene.ts";

interface TitleProps {
    id: string,
    value: string
}

export default function Title ({ id, value }: TitleProps) {
    const [newValue, setNewValue] = useState('');

    useEffect(() => {
        setNewValue(value)
    }, [value]);

    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        setNewValue(event.target.value);
    }

    const onBlur = async () => {
        const data = await renameScene(id, newValue)
        if (data) {
            console.log(data)
        }
    }

    return (
        <div className="zen-mode-transition z-sidebar hidden w-full overflow-hidden lg:block">
            <div
                data-value={newValue}
                className="h-full relative after:content-[attr(data-value)] after:invisible after:whitespace-pre after:block after:w-full border-b border-transparent after:min-w-[4rem] after:focus-within:min-w-0 font-semibold focus-within:!border-b focus-within:!border-solid focus-within:!border-primary"
                style={{height: 'var(--lg-button-size)'}}
            >
                <Input
                    spellCheck="false"
                    autoComplete="off"
                    className="w-full h-full absolute inset-0 truncate resize-none cursor-pointer !p-0 !border-0 !shadow-none bg-transparent focus:cursor-text hover:!text-primary focus:!text-color-text focus:!outline-none focus:!ring-0 focus:!ring-offset-0 py-0"
                    type="text"
                    title="Click to rename scene"
                    value={newValue}
                    onChange={onChange}
                    onBlur={onBlur}
                    style={{height: 'var(--lg-button-size)'}}
                />
            </div>
        </div>
    )
}