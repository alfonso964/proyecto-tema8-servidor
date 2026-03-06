import { v2 as cloudinary } from 'cloudinary';
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"; 

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function POST(req) {

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: "No autorizado - Token faltante" }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "No autorizado - Token inválido" }, { status: 401 });
  }
 

  try {
    const formData = await req.formData();
    const file = formData.get('file');     
    const carId = formData.get('carId');   

    if (!file || !carId) {
      return NextResponse.json({ error: "Faltan datos (archivo o carId)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ 
        folder: "escuela_coches", 
        resource_type: "image" 
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    const newImage = await prisma.carImage.create({
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        carId: parseInt(carId)
      }
    });

    return NextResponse.json(newImage, { status: 201 });

  } catch (error) {
    console.error("Error Cloudinary:", error);
    return NextResponse.json({ error: "Fallo al procesar la imagen" }, { status: 500 });
  }
}