// src/app/api/images/route.js
import { v2 as cloudinary } from 'cloudinary';
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = auth(async function POST(req) {

  if (!req.auth) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
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
});