// src/app/api/cars/route.js
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: Público - Ver todos los coches con sus fotos
export async function GET() {
    try {
        const cars = await prisma.car.findMany({
            include: { images: true }
        })
        return NextResponse.json(cars)
    } catch (error) {
        return NextResponse.json({ error: "Error al obtener coches" }, { status: 500 })
    }
}

// POST: Protegido - Solo usuarios logueados pueden añadir coches
export const POST = auth(async function POST(req) {
    if (!req.auth) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { brand, model, year, price, description } = body

        const newCar = await prisma.car.create({
            data: {
                brand,
                model,
                year: parseInt(year),
                price: parseFloat(price),
                description,
                userId: req.auth.user.id 
            }
        })

        return NextResponse.json(newCar, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: "Datos del coche inválidos" }, { status: 400 })
    }
})