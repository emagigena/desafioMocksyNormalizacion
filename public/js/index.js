const { denormalize, schema } = normalizr
const schemaAuthor = new schema.Entity('authors', {}, { idAttribute: 'email' })
const schemaMensaje = new schema.Entity('mensajes', {
    author: schemaAuthor
})
const schemaChat = new schema.Entity('chats', {
    mensajes: [schemaMensaje]
})

const CHATMSG = 'chat_msg'

async function renderIndex() {


    Handlebars.registerPartial('header', await (await fetch('static/views/partials/header.hbs')).text());
    Handlebars.registerPartial('prodList', await (await fetch('static/views/partials/prodList.hbs')).text());
    Handlebars.registerPartial('tableRaw', await (await fetch('static/views/partials/tableRaw.hbs')).text());
    Handlebars.registerPartial('chat', await (await fetch('static/views/partials/chat.hbs')).text());
    Handlebars.registerPartial('chatMsg', await (await fetch('static/views/partials/chatMsg.hbs')).text());
    Handlebars.registerPartial('footer', await (await fetch('static/views/partials/footer.hbs')).text());


    const template = Handlebars.compile(await (await fetch('static/views/main.hbs')).text());


    const socket = io();

    socket.on('connect', async () => {


        document.querySelector('span').innerHTML = template()

        const chatForm = document.querySelector('#chatForm')
        const inputEmail = document.querySelector('#chatEmail')
        const inputNombre = document.querySelector('#chatNombre')
        const inputApellido = document.querySelector('#chatApellido')
        const inputEdad = document.querySelector('#chatEdad')
        const inputAlias = document.querySelector('#chatAlias')
        const inputAvatar = document.querySelector('#chatAvatar')
        const inputMsj = document.querySelector('#chatMsj')
        const chatPC = document.querySelector('#porcentajeComp')
        const chatList = document.querySelector('#chatList')


        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const mensaje = {
                author: {
                    email: inputEmail.value, nombre: inputNombre.value, apellido: inputApellido.value, 
                    edad: inputEdad.value, alias: inputAlias.value, avatar: inputAvatar.value}, text: inputMsj.value
                }

            socket.emit(CHATMSG, mensaje);
            inputMsj.value = null
        });

       
        socket.on(CHATMSG, (data) => { 
            const dData = denormalize(data.result, schemaChat, data.entities)
            const porcentaje = ((JSON.stringify(dData).length / JSON.stringify(data).length - 1) * 100).toFixed(1);
            chatPC.innerHTML = 'Compresión: ' + (porcentaje > 0 ? porcentaje : 0) + '%'

            const msgs = dData.mensajes.map(m => {
                m.timeStamp = (new Date(m.timeStamp)).toLocaleString()
                return m
            })

            chatList.innerHTML = Handlebars.compile('{{> chatMsg}}')({ msgs: msgs })

            chatList.parentElement.scroll(0, chatList.parentElement.scrollHeight)
        });
        const response = await fetch('/api/productos-test');
        const productos = await response.json();
        const tbody = document.querySelector('#tablaProd tbody')
        tbody.innerHTML = Handlebars.compile('{{> tableRaw}}')({ productos: productos })
    })


    socket.on('disconnect', () => {
        document.querySelector('#serverAlert').style.display = null
    })
}
renderIndex()