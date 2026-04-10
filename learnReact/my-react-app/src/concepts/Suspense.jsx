import {createRoot} from 'react-dom/client';
import { Suspense, lazy }  from 'react';

const Cars = lazy(() => import('./cars')); //lazy loading of the component, it will only be loaded when it's needed

export function SusCar(){
    return(
        <div>
            <Suspense fallback={<div>loading</div>}>
                <Cars />
            </Suspense>
        </div>
    );
}