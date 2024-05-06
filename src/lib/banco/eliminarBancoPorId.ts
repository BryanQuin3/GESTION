import { ApiResponseData } from "../definitions"

export default async function eliminarBancoPorId(id: string): Promise<ApiResponseData|string|undefined> {
  try{
    const response = await fetch(`/api/banco/${id}`, {
      method: "DELETE",
      headers:{
        "Content-Type": "application/json",
      },
    })

    const data:ApiResponseData = await response.json()
    return data
  
  }catch(error){
    if(error instanceof Error) return error.message
  }
}