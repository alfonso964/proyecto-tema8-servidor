import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request, { params }) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    try { jwt.verify(token, process.env.JWT_SECRET); } 
    catch (err) { return NextResponse.json({ error: "Token inválido" }, { status: 401 }); }

    const { imageId } = params;

    try {
        const image = await prisma.carImage.findUnique({
            where: { id: parseInt(imageId) }
        });

        if (!image) {
            return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 });
        }

        await cloudinary.uploader.destroy(image.publicId);

        await prisma.carImage.delete({
            where: { id: parseInt(imageId) }
        });

        return NextResponse.json({ message: "Imagen eliminada con éxito" }, { status: 200 });
    } catch (error) {
        console.error("Error al borrar:", error);
        return NextResponse.json({ error: "Fallo al borrar la imagen" }, { status: 500 });
    }
}