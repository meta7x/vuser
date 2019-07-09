export default class UserData {
    constructor(user) {
        // reference to the owner of this instance
        this._user = user;

        // caches the user data locally
        this._data = {};
        if (user.options.cacheInLocalStorage) {
            let string = window.localStorage.getItem('vuser');
            this._data = JSON.parse(string);
        }

        // clear local cache if local caching is disabled
        if (!user.options.cacheInLocalStorage && user.options._localStorageAvailable) {
            window.localStorage.removeItem('vuser');
        }

        // remembers which properties have been changed
        // at what time, to enable proper syncing
        this._dirty = {};
    }

    _cacheLocally(key, value) {
        if (this._data[key] != value) {
            this._data[key] = value;
            if (this.user.options.cacheInLocalStorage) {
                window.localStorage.setItem('vuser', JSON.stringify(this._data));
            }
        }
    }


    /**
     * Returns the value for the given key.
     * The value will be cached and returned from cache on future calls.
     * 
     * To load data from the database, the user must be signed in.
     * 
     * @param {string} key 
     * @param {boolean} ignoreCache if set to `true`, the value will be loaded from the database every time.
     */
    async get(key, ignoreCache) {
        if (key in this.cache && !ignoreCache) return this._data[key];
        else {
            const value = await this._user.doLoad(key).value;
            this._cacheLocally(key, value);
            if (key in this._dirty) {
                delete this._dirty[key];
            }
            return value;
        }
    }

    /**
     * Sets a property locally and marks it as dirty, later to be synced.
     * 
     * To store data in the database, the user must be signed in.
     * 
     * @param {string} key the key to store the value under
     * @param {*} value the value to be stored
     * @param {boolean} syncImmediately if set to `true`, uploads the new value to the database immediately.
     */
    async set(key, value, syncImmediately) {
        this._cacheLocally(key, value);
        if (syncImmediately) {
            await this._user.doStore(key, value);
            if (key in this._dirty) {
                delete this._dirty[key];
            }
        } else {
            this._dirty[key] = Date.now();
        }
    }

    /**
     * Syncs all dirty values by comparing timestamps to the
     * current version in the database.
     * Also updates all cached values.
     * 
     * Requires the user to be logged in.
     * 
     * This method is not race condition free:
     * If called e.g. from multiple devices, it is possible that
     * an outdated value gets stored in the database
     */
    async sync() {
        await Promise.all(
            Object.keys(this._data).map(async key => {
                let stored = await load(key);
                if (key in this._dirty) {
                    let value = this._data[key];
                    let timestamp = this._dirty[key];

                    if (stored.timestamp < timestamp) {
                        this._user.store(key, value, timestamp);
                    } else {
                        this._cacheLocally(key, stored.value);
                    }
                } else {
                    this._cacheLocally(key, stored.value);
                }
            })
        );

        this._dirty = {};
    }
}