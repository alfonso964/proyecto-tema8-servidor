// src/app/api/cars/[id]/route.js
import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: Ver un solo coche (Público)
export async function GET(req, { params }) {
    const { id } = await params
    const car = await prisma.car.findUnique({
        where: { id: parseInt(id) },
        include: { images: true }
    })

    if (!car) return NextResponse.json({ error: "Coche no encontrado" }, { status: 404 })
    return NextResponse.json(car)
}

// PUT: Editar un coche (Protegido)
export const PUT = auth(async function PUT(req, { params }) {
    if (!req.auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params
    const body = await req.json()

    try {
        const updatedCar = await prisma.car.update({
            where: { id: parseInt(id) },
            data: body
        })
        return NextResponse.json(updatedCar)
    } catch (error) {
        return NextResponse.json({ error: "Error al actualizar" }, { status: 400 })
    }
})

// DELETE: Borrar un coche (Protegido)
export const DELETE = auth(async function DELETE(req, { params }) {
    if (!req.auth) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

    const { id } = await params

    try {
        await prisma.car.delete({
            where: { id: parseInt(id) }
        })
        return NextResponse.json({ message: "Coche eliminado correctamente" })
    } catch (error) {
        return NextResponse.json({ error: "No se pudo eliminar" }, { status: 400 })
    }
})