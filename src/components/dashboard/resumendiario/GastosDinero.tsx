import React from 'react';

interface GastosDineroProps {
  efectivo: number,
  deposito: number,

}
const GastosDinero: React.FC<GastosDineroProps> = ({ efectivo,deposito}) => {
    return (
      <div className="mb-6 bg-gray-700 shadow-lg p-6">
        <h2 className=" mb-4 font-bold">Gastos de Dinero</h2>
        <table className="flex space-x-4 border border-black w-full">
          
          <tbody>
            <tr>
            <td className="p-2">Efectivo</td>
          <td className="p-2">{efectivo}</td>
        </tr>
        <tr>
          <td className="p-2">Deposito</td>
          <td className="p-2">{deposito}</td>
        </tr>
       
          </tbody>
        </table>
      </div>
    );
  }
  
  export default GastosDinero;

