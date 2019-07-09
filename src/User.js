export default class User {

    _publicMethods = ['options', 'get', 'set', 'sync', 'authenticate', 'load', 'store', 'convert', 'reconvert'];

    constructor(options) {
        if (!this.options.load) throw new Error('Vuser: \'load\' option must be defined.');
        if (!this.options.store) throw new Error('Vuser: \'store\' option must be defined.');
        if (!this.options.authenticate) throw new Error('Vuser: \'authenticate\' option must be defined.');


        options.userDataClass = options.userDataClass || UserData;
        if (!options.userDataClass instanceof UserData) {
            throw new TypeError('Vuser: \'userDataClass\' must be instance of the UserData class.')
        }
        if (typeof this.options.load !== 'function') throw new TypeError('Vuser: \'load\' must be a function');
        if (typeof this.options.store !== 'function') throw new TypeError('Vuser: \'store\' must be a function');
        if (typeof this.options.authenticate !== 'function') throw new TypeError('Vuser: \'authenticate\' must be a function');
        if (this.options.convert && typeof this.options.convert !== 'function') throw new TypeError('Vuser: \'convert\' must be a function');
        if (this.options.reconvert && typeof this.options.reconvert !== 'function') throw new TypeError('Vuser: \'reconvert\' must be a function');
        if (this.options.cacheInLocalStorage && typeof this.options.cacheInLocalStorage !== 'boolean') throw new TypeError('Vuser: \'convert\' must be a boolean value');

        this.options = options;
    }

    async authenticate() {
        this.options.authenticate(this, ...arguments);
    }

    get _data() {
        if (!this._userData) this._userData = new UserData(this);
        return this._userData;
    }

    get(key) {
        return this._data.get(key);
    }

    set(key, value) {
        return this._data.set(key, value);
    }

    sync() {
        return this._data.sync();
    }

    async doLoad(key) {
        await this.authenticate();
        let object = await this.options.load(key);
        return this.reconvert(object);
    }

    async doStore(key, value, timestamp) {
        await this.authenticate();
        timestamp = timestamp || Date.now();
        let object = this.convert(value, timestamp);
        return this.options.store(key, object);
    }

    get convert() {
        if (this.options.convert) return this.options.convert;
        else return function (value, timestamp) {
            return JSON.stringify({ value, timestamp })
        }
    }

    get reconvert() {
        if (this.options.reconvert) return this.options.reconvert;
        else return function (object) {
            return JSON.parse(object);
        }
    }
}