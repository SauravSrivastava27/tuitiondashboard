import React from "react";

export default function Table({ columns, data, renderRow }) {
  return (
    <div className="overflow-x-auto nb-card !p-0 border-none shadow-none bg-transparent">
      <table className="nb-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} className="hover:bg-nb-yellow/5 transition-colors">
                {renderRow(row)}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="text-center text-gray-500 py-12 font-bold uppercase tracking-widest bg-white"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

