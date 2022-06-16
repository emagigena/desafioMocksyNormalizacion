
import { faker } from '@faker-js/faker';
faker.locale = 'es';

import { Router } from "express";
const routerProductosTest = Router()

const listaProductosTest = []
for (let i = 1; i <= 5; i++) {
    const prod = {
        id: i,
        title: faker.commerce.productName(),
        price: faker.commerce.price(500, 3000, 0),
        thumbnail: faker.image.imageUrl()
    }
    listaProductosTest.push(prod)
}

routerProductosTest.get("/", async (req, res) => {
    let errCode = 0 
    try {
        res.json(listaProductosTest)
    } catch (error) {
        res.status(500).json({ error: errCode, descripcion: error });
    }
})

export default routerProductosTest