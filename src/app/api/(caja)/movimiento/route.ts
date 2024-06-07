
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { generateApiErrorResponse, generateApiSuccessResponse } from "@/lib/apiResponse";

import { Movimiento, MovimientoDetalle } from "@prisma/client";
import reflejarMovimiento from "@/lib/moduloCaja/movimiento/reflejarMovimiento";
import pagarFactura from "@/lib/moduloCaja/factura/pagarFactura";
import verifyUser from "@/lib/auth/verifyUser";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const body: { mov: Movimiento, movsDetalles?: MovimientoDetalle[], username?: string, password?: string, concepto?: string } = await req.json();
    const { mov, movsDetalles, username, password, concepto } = body;

    if(!mov.esIngreso || !mov.monto || !mov.aperturaId) return generateApiErrorResponse("Faltan datos para el movimiento", 400)

    if (!mov || !movsDetalles) {
      return generateApiErrorResponse("Faltan datos para el movimiento", 400);
    }

    if (movsDetalles.length === 0) {
      return generateApiErrorResponse("Faltan los detalles del movimiento", 400);
    }

    const montoDecimal = new Decimal(mov.monto);

    if (montoDecimal.lessThanOrEqualTo(0)) {
      return generateApiErrorResponse("El monto debe ser mayor a 0", 400);
    }

    const movimiento = await prisma.$transaction(async (tx) => {
      const movimientoTx = await tx.movimiento.create({
        data: {
          monto: mov.monto,
          facturaId: mov.facturaId,
          aperturaId: mov.aperturaId,
          esIngreso: mov.esIngreso,
        },
        include: {
          apertura: {
            include: {
              caja: {
                select: {
                  id: true,
                },
              },
            },
          },
        }
      });

      if (!movimientoTx) throw new Error("Error generando el movimiento");

      const sum = movsDetalles.reduce((total, m) => total + (+m.monto), 0);

      if(movimientoTx)

      if (!montoDecimal.equals(sum)) {
        throw new Error("La suma de los movimientos detalle no coincide con el monto del movimiento");
      }

      await tx.movimientoDetalle.createMany({
        data: movsDetalles.map((m) => ({ ...m, movimientoId: movimientoTx.id })),
        skipDuplicates: true,
      });

      if (!movimientoTx.esIngreso) {
        if (!username || !password) throw new Error("Faltan credenciales para crear el comprobante");
        if (!concepto) throw new Error("Falta el concepto para crear el comprobante");

        const user = await verifyUser(username, password, "ADMIN");

        await tx.comprobante.create({
          data: {
            movimientoId: movimientoTx.id,
            userId: user.id,
            monto: mov.monto,
            concepto: concepto,
          }
        });
      }

      return movimientoTx;
    });
    if (movimiento.facturaId) {
      await pagarFactura(movimiento.facturaId, mov.monto);
    }

    await reflejarMovimiento(movimiento.apertura.caja.id, mov.monto, mov.esIngreso);

    return generateApiSuccessResponse(200, "El movimiento fue generado correctamente");
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
      return generateApiErrorResponse("El movimiento ya existe", 400);
    } else {
      console.error(err);
      return generateApiErrorResponse("Hubo un error en la creación del movimiento", 500);
    }
  }
}


export async function GET() {
  const movimiento = await prisma.movimiento.findMany();
  return generateApiSuccessResponse(
    200,
    "Exito al obtener los movimientos",
    movimiento
  );
}
