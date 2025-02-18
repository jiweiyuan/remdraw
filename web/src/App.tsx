import AppProvider from './providers';
import AppRouter from './routes';
import {useEffect, useRef} from "react";
// @ts-ignore
import workUrl from '@/ai.worker.ts?worker&url';


export default function App() {
    const workerRef = useRef<Worker>();

    useEffect(() => {
        workerRef.current = new Worker(new URL(workUrl, import.meta.url), { type: 'module' });

        const onMessageReceived = (event: MessageEvent) => {
            // console.log("received message from web worker", event.data)
            switch (event.data.type) {
                case 'error':
                    console.log(event.data.message)
                    break;
                case 'result':
                    console.log('result', event.data.data)
                    break;
            }
        };

        // Attach the callback function as an event listener.
        workerRef.current.addEventListener('message', onMessageReceived);

        return () => {
            workerRef.current?.terminate()
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            // console.log('sending message')
            workerRef.current?.postMessage({ text: "I love transformer" })
        }, 2000);
    }, []);
    return (
        <AppProvider>
            <AppRouter />
        </AppProvider>
    );
}
