import ContenedorMongo from '../../contenedores/ContenedorMongo.js';
import { mensajesModel } from '../../models/mensajes.js'

class MensajesDaoMongo extends ContenedorMongo {

    constructor() {
        super(mensajesModel);
    }
}

export { MensajesDaoMongo }