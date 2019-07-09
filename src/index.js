
import Vuser from './Vuser';

function testLocalStorage(options) {
    let localStorageAvailable = true;
    try {
        window.localStorage.setItem('test', '1');
        let item = window.localStorage.getItem('test');
        window.localStorage.removeItem('test');
        if (item !== '1') throw new Error('Vuser: Local storage test failed.')
    } catch (e) {
        localStorageAvailable = false;
        if (options.cacheInLocalStorage) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(e);
                console.error('Vuser: Local storage is no supported on this device, setting cacheInLocalStorage to false for now.');
            }
            options.cacheInLocalStorage = false;
        }
    }
    options._localStorageAvailable = localStorageAvailable;
}

let _Vue;
const plugin = {
    
}

export default new Proxy(plugin, {
    construct(target, argumentList) {
        return target.create(...argumentList);
    }
})