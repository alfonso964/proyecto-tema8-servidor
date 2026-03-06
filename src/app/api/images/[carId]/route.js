import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
    // Obtenemos el carId de los parámetros de la URL
    const { carId } = params;

    try {
        const images = await prisma.carImage.findMany({
            where: { 
                carId: parseInt(carId) 
            }
        });

        if (images.length === 0) {
            return NextResponse.json({ message: "No se encontraron imágenes para este coche" }, { status: 404 });
        }

        return NextResponse.json(images, { status: 200 });
    } catch (error) {
        console.error("Error al obtener imágenes:", error);
        return NextResponse.json({ error: "Error interno al buscar imágenes" }, { status: 500 });
    }
}