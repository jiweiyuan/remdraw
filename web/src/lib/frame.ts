// when update scene, we need to find all created, then make invaild frames for spaced repetition valid
export const findCreatedFrames = (elements: any[]): string[] => {
    let frames = elements.filter((element) =>  {
        return element?.type === 'CREATE' &&  element?.path?.length === 1 &&  element?.value?.type === 'frame';
    });

    return frames.map((element) => {
        return element.value.id;
    })
}


// when update scene, we need to find all deleted, then make saved frames for spaced repetition invalid
export const findDeletedFrames = (elements: any[]) : string[] => {
    let frames = elements.filter((element) => {
        return element?.type === 'REMOVE' && element?.path?.length === 1 && element?.oldValue?.type === 'frame';
    });

    return frames.map((element) => {
        return element.oldValue.id;
    })
}
