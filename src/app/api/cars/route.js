// src/app/api/cars/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// GET: Listar coches (MODIFICADO para incluir imágenes)
export async function GET(request) {
  try {
    const cars = await prisma.car.findMany({
      include: {
        images: true // Esto le dice a Prisma que traiga también las fotos asociadas
      }
    });
    return NextResponse.json(cars);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener coches" }, { status: 500 });
  }
}

// POST: Crear un coche (Se queda igual porque ya funciona bien)
export async function POST(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: "No autorizado - Falta Token" }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let userId;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id; 
  } catch (err) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { brand, model, year, price, description } = body;

    const newCar = await prisma.car.create({
      data: {
        brand,
        model,
        year: parseInt(year),
        price: parseFloat(price),
        description,
        user: {
          connect: { id: userId }
        }
      }
    });

    return NextResponse.json(newCar, { status: 201 });

  } catch (error) {
    console.error("Error al crear coche:", error);
    return NextResponse.json({ error: "Error al crear el coche en la base de datos" }, { status: 500 });
  }
}