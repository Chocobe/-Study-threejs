// react
import {
    useRef,
    useCallback,
} from 'react';
// style
import './App.css';

function App() {
    const $boxRef = useRef<HTMLDivElement | null>(null);
    const animationIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const keyframeDataRef = useRef<{ width: number; height: number; }[][]>([]);

    const recordKeyframe = useCallback(() => {
        const $box = $boxRef.current;

        if (!$box) {
            return;
        }

        const {
            width,
            height,
        } = $box.getBoundingClientRect();

        const keyframeData = keyframeDataRef.current;
        const index = keyframeData.length - 1;

        keyframeData[index].push({ 
            width, 
            height,
        });

        animationIdRef.current = window.requestAnimationFrame(recordKeyframe);
    }, []);

    const onClick = useCallback(() => {
        const $box = $boxRef.current;

        if (!$box) {
            return;
        }

        keyframeDataRef.current.push([]);
        recordKeyframe();

        $box.classList.add('active');
    }, [recordKeyframe]);

    const onAnimationEnd = useCallback(() => {
        $boxRef.current?.classList.remove('active');

        if (!animationIdRef.current) {
            return;
        }

        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;

        console.clear();
        console.group('onAnimationEnd()');
        console.log('keyframeData: ', keyframeDataRef.current);
        console.groupEnd();
    }, []);

    return (
        <div 
            ref={$boxRef}
            className="box"
            onClick={onClick}
            onAnimationEnd={onAnimationEnd}>
            Box
        </div>
    );
}

export default App;
