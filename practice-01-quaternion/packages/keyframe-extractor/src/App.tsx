// react
import {
    useRef,
    useCallback,
} from 'react';
// style
import './App.css';

function App() {
    const $boxRef = useRef<HTMLDivElement | null>(null);

    const onClick = useCallback(() => {
        const $box = $boxRef.current;

        if (!$box || $box.classList.contains('active')) {
            return;
        }

        $box.classList.add('active');
    }, []);

    const onAnimationEnd = useCallback(() => {
        const $box = $boxRef.current;

        if (!$box) {
            return;
        }

        $box.classList.remove('active');
    }, []);

    return(
        <div className="wrapper">
            <div 
                ref={$boxRef}
                className="box"
                onClick={onClick}
                onAnimationEnd={onAnimationEnd}>
                Box
            </div>
        </div>
    );
}

export default App;
