export default class SceneCache {
    private readonly id: string;
    // A static map to hold instances of CacheManager by id
    static instances = new Map<string, SceneCache>();

    constructor(id: string) {
        this.id = id;
    }

    // Static method to get or create an instance based on id
    static of(id: string): SceneCache {
        if (!SceneCache.instances.has(id)) {
            SceneCache.instances.set(id, new SceneCache(id));
        }
        return SceneCache.instances.get(id)!;
    }

    // Method to set values in localStorage
    set(data: any) {
        if (!data.version || !this.id) {
            console.log('Invalid data.');
            return;
        }
        console.log(`Old version: ${localStorage.getItem(`scene-${this.id}-version`)}`);
        console.log(`New version: ${data.version}`);
        let oldVersion = localStorage.getItem(`scene-${this.id}-version`);
        if (oldVersion && Number(oldVersion) > data.version) {
            console.log(`Scene ${this.id} version ${data.version} is older than ${oldVersion}.`);
            return;
        }
        localStorage.setItem(`scene-${this.id}-version`, data.version);
        localStorage.setItem(`scene-${this.id}-elements`, JSON.stringify(data.elements));
        localStorage.setItem(`scene-${this.id}-app_state`, JSON.stringify(data.app_state));
        console.log(`Scene ${this.id} data set.`);
    }


    // Method to get values from localStorage
    get() {
        const version = localStorage.getItem(`scene-${this.id}-version`);
        const elements = JSON.parse(<string>localStorage.getItem(`scene-${this.id}-elements`));
        const appState = JSON.parse(<string>localStorage.getItem(`scene-${this.id}-app_state`));
        return { version, elements, appState };
    }

    // Method to clear values from localStorage
    clear() {
        if (!SceneCache.instances.has(this.id)) {
            console.log(`Scene ${this.id} not found.`);
            return;
        }
        localStorage.removeItem(`scene-${this.id}-version`);
        localStorage.removeItem(`scene-${this.id}-elements`);
        localStorage.removeItem(`scene-${this.id}-app_state`);
        console.log(`Scene ${this.id} data cleared.`);
    }
}

// Example usage:
// const sceneCache = SceneCache.of('123').set({ version: 1, element: [], app_state: {} });
// console.log(sceneCache.get());
// sceneCache.of('123').clear();
