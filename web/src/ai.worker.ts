import { AutoTokenizer, CLIPTextModelWithProjection, AutoProcessor, CLIPVisionModelWithProjection} from '@huggingface/transformers';

// Singleton class for managing CLIP embeddings
// for more information on CLIP, see https://huggingface.co/jinaai/jina-clip-v1
class CLIPSingleton {
    static textModelName = 'jinaai/jina-clip-v1';
    static visionModelName = 'jinaai/jina-clip-v1';
    static processorName = 'Xenova/clip-vit-base-patch32';
    static textModel: any;
    static visionModel: any;
    static processor: any;
    static tokenizer: any;

    static async getTextModel() {
        if (!this.textModel || !this.tokenizer) {
            this.tokenizer = await AutoTokenizer.from_pretrained(this.textModelName);
            this.textModel = await CLIPTextModelWithProjection.from_pretrained(this.textModelName);
        }
        return { model: this.textModel, tokenizer: this.tokenizer };
    }

    static async getVisionModel() {
        if (!this.visionModel || !this.processor) {
            this.processor = await AutoProcessor.from_pretrained(this.processorName);
            this.visionModel = await CLIPVisionModelWithProjection.from_pretrained(this.visionModelName);
        }
        return { model: this.visionModel, processor: this.processor };
    }
}

// Event listener for handling text and image embedding requests
addEventListener('message', async (event: MessageEvent) => {
    const { text } = event.data;
    console.log('received text', text);

    // Retrieve the CLIP models
    const { model, tokenizer } = await CLIPSingleton.getTextModel();
    if (!model || !tokenizer) {
        postMessage({ type: 'error', message: 'Failed to load CLIP model' });
        return;
    }

    // Compute text embeddings
    const text_inputs = tokenizer(text, { padding: true, truncation: true });
    const {text_embeds} = await model(text_inputs);
    if (!text_embeds) {
        postMessage({ type: 'error', message: 'Failed to compute text embeddings' });
        return;
    }
    postMessage({ type: 'result', message: 'Computed text embeddings', data: text_embeds[0].data });
});
