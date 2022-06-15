import 'dotenv/config'
import path from 'path' 


import { normalize, schema } from 'normalizr'


const schemaAuthor = new schema.Entity('authors', {}, { idAttribute: 'email' })
const schemaMensaje = new schema.Entity('mensajes', {
    author: schemaAuthor
})
const schemaChat = new schema.Entity('chats', {
    mensajes: [schemaMensaje]
})


import express from 'express'
const app = express();
import { createServer } from "http"
import { Server } from "socket.io"
const httpServer = createServer(app);
const io = new Server(httpServer);
import routerProductosTest from './src/routes/routerProductosTest.js';
import { MensajesDaoMongo } from './src/daos/mensajes/MensajesDaoMongo.js'
const CHATMSG = 'chat_msg'

async function serverMain() {
    try {
        app.use('/api/productos-test', routerProductosTest)
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: err });
        })

        app.get("/", (req, res) => {
            try {
                res.sendFile(path.resolve('./public/index.html'));

            } catch (error) {
                res.status(500).json({ error: error });
            }
        })

        const STATICPATH = '/static'
        app.use(STATICPATH, express.static(path.resolve('./public')));

        app.use('*', (req, res) => {
            res.status(404).json(
                { error: -2, descripcion: `ruta ${req.originalUrl} (método ${req.method}) no implementada` }
            )
        })

        const contenedorChat = new MensajesDaoMongo()
        const chat = { id: 'mensajes' }
        chat.mensajes = await contenedorChat.getAll()

        io.on('connection', (socket) => {

            console.log('Client connected:', socket.id);
            socket.emit(CHATMSG, normalize(chat, schemaChat))

            socket.on(CHATMSG, async (data) => {
                try {
                    let newId = await contenedorChat.save(data)
                    if (newId) {
                        const msj = await contenedorChat.getById(newId)
                        chat.mensajes.push(msj)
                        io.sockets.emit(CHATMSG, normalize(chat, schemaChat));

                    } else {
                        throw 'Error al guardar nuevo Mensaje de Chat'
                    }
                } catch (error) {
                    console.log(error);
                }
            });

            socket.on('disconnect', () => console.log('Disconnected!', socket.id));
        });


        io.engine.on("connection_error", (err) => {
            console.log(err.req);     
            console.log(err.code);    
            console.log(err.message);  
            console.log(err.context);  
        });

        try {
            const PUERTO = process.env.PORT || 8080;
            httpServer.listen(PUERTO, () => console.log(`Server running. PORT: ${httpServer.address().port}`));

        } catch (error) {
            httpServer.listen(0, () => console.log(`Server running. PORT: ${httpServer.address().port}`));
        }

        httpServer.on("error", error => {
            console.log('Error en el servidor:', error);
        })

    } catch (error) {
        console.log('Error en el hilo principal:', error);
    }
}
serverMain()