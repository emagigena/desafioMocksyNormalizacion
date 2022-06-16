import 'dotenv/config'

//Importo mongoose
import mongoose from "mongoose";


const formatDoc = (doc) => {
    if (doc) {
        const item = {
            id: doc._doc._id,
            ...doc._doc
        }
        delete item._id
        return item
    } else {
        return null
    }
}

class ContenedorMongo {

    constructor(model) {
        mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        this.model = model;
    }

    async getAll() { 
        try {
            const result = await this.model.find({}, { __v: 0 })
            return result.map(doc => formatDoc(doc))

        } catch (error) {
            console.log(`Error al querer leer el contenido de la colección ${this.model.modelName}.`, error)
            return null
        }
    }

    async save(obj) { 
        try {
            const item = { timeStamp: Date.now(), ...obj }
            const result = await new this.model(item).save();
            return result._id

        } catch (error) {
            console.log(`Pasaron cosas al guardar nuevo objeto en la colección ${this.model.modelName}.`, error);
            return null
        }
    }

    async getById(id) { 
        try {
            return formatDoc(await this.model.findById(id, { __v: 0 }))

        } catch (error) {
            console.log(`Error al obtener objeto con id ${id} de la colección ${this.model.modelName}.`, error);
            return null
        }
    }

    async deleteById(id) { 
        try {
            if (await this.model.findByIdAndDelete(id)) {
                return true
            } else {
                return false
            }
        } catch (error) {
            console.log(`Error al eliminar objeto con id ${id} de la colección ${this.model.modelName}.`, error);
            return null
        }
    }


    async editById(id, obj) {
        try {
            delete obj.id 
            return await this.model.findByIdAndUpdate(id, obj) ? true : false

        } catch (error) {
            console.log(`Error al editar objeto con id ${id} de la colección ${this.model.modelName}.`, error);
            return null
        }
    }
}

export default ContenedorMongo