const database = {
    "0": { name: "Tofur", surname: "Asd", age: 21 },
    "1": { name: "Pippo", surname: "Qwe", age: 14 },
    "2": { name: "Pluto", surname: "Rat", age: 51 },
    "3": { name: "Cupar", surname: "Pre", age: 23 },
    "4": [
        {
            "0": "tofur",
            "1": "tofur",
            "2": "pluto",
            "3": "cupar",
            "5": "nationalities"
        }
    ],
    "5": [
        {
            "6": "italian",
            "7": "french"
        }
    ],
    "6": [
        {
            "0": "tofur",
            "3": "cupar"
        }
    ],
    "7": [
        {
            "1": "pippo"
        }
    ]
}

class DatabaseConnector {
    database: {};
    constructor() {
        this.database = database
    }
    async select(id) {
        return new Promise<object>((resolve, reject) => {
            if (this.database[id]) {
                resolve(this.database[id]);
            }
            else {
                reject();
            }
        });
    }
}

class Database {
    cache: {};
    db: DatabaseConnector;
    constructor() {
        this.db = new DatabaseConnector()
        this.cache = {}
    }
    async select(id: string) {
        if (this.cache[id] === undefined) {
            const data = await this.db.select(id)
            if (data === undefined) {
                return undefined
            }
            this.cache[id] = data
        }
        return this.cache[id]
    }
}

const db = new Database()

class EntityCollection {
    slug: string;
    collection: object;
    constructor(collection, slug) {
        this.collection = collection
        if (slug) {
            this.slug = slug
        }
    }
    findBySlug(slug, autoGet) {
        if (typeof (autoGet) === 'undefined') autoGet = true;
        let x = {}
        for (let i in this.collection) {
            let obj = this.collection[i]
            if (x[obj.slug] === undefined) {
                x[obj.slug] = []
            }
            x[obj.slug].push(obj)
        }
        if (x[slug] && x[slug].length === 1) {
            if(autoGet){
                return x[slug][0].get()
            } else {
                return x[slug][0]
            }
        } else {
            return new EntityCollection(x[slug], slug)
        }
    }
    each(callback) {
        for (let entity in this.collection) {
            callback(this.collection[entity], entity)
        }
    }
    get() {
        for (let hash in this.collection) {
            this.collection[hash].get()
        }
        return this.collection
    }
}

class Entity {
    properties: {};
    slug: string;
    hash: string;
    database: Database;
    constructor(hash: string, slug) {
        this.database = db
        this.hash = hash
        if (slug) {
            this.slug = slug
        }
        this.properties = {}
    }
    async fetch() {
        this.properties = await this.database.select(this.hash)
        for (let key in this.properties) {
            let property = this.properties[key]
            if (typeof property == "object") {
                for (let hash in property)
                    this.properties[key][hash] = new Entity(hash, this.properties[key][hash])
            }
        }
        return this
    }
    async get(property?: string) {
        if (this.properties) {
            await this.fetch()
        }
        console.log(this)
        if (property !== undefined) {
            if (typeof this.properties[property] == "object") {
                return new EntityCollection(this.properties[property], this.slug)
            } else {
                return this.properties[property]
            }
        } else if (typeof this.properties === "object" && typeof this.properties[0] == "object") {
            return new EntityCollection(this.properties[0], this.slug)
        } else {
            return this.properties
        }
    }
}

export { Entity }
export { EntityCollection }
export { Database }
export { DatabaseConnector }