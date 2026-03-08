import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { carId } = await params; 

        const images = await prisma.carImage.findMany({
            where: { 
                carId: parseInt(carId) 
            }
        });

        if (!images || images.length === 0) {
            return NextResponse.json({ message: "No se encontraron imágenes" }, { status: 404 });
        }

        return NextResponse.json(images, { status: 200 });
    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}