import { ApiResponseData } from "../../definitions"

export default async function agregarCheque(
  numeroCheque: string,
  esRecibido: boolean,
  monto: number,
  fechaEmision: Date,
  involucrado: string,
  bancoChequeId: string,
  cuentaBancariaAfectadaId: string
): Promise<ApiResponseData|string|undefined> {
  try{
    const response = await fetch("/api/cheque", {
      method: "POST",
      headers:{
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numeroCheque: numeroCheque,
        esRecibido: esRecibido,
        monto: monto,
        fechaEmision: fechaEmision,
        involucrado:involucrado,
        bancoChequeId: bancoChequeId,
        cuentaBancariaAfectadaId: cuentaBancariaAfectadaId
      })
    })

    const data:ApiResponseData = await response.json()
    return data
  
  }catch(error){
    if(error instanceof Error) return error.message
  }
}