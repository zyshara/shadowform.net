// src/swatchbook/views/SwatchGrid.jsx
export default function SwatchGrid({ table }) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {table.getRowModel().rows.map((row) => {
        const swatch = row.original;

        return (
          <button
            key={swatch.id}
            className="aspect-square rounded-full border hover:scale-105 transition"
          >
            <img
              src={swatch.image}
              alt={swatch.name}
              className="h-full w-full rounded-full object-cover"
            />
          </button>
        );
      })}
    </div>
  );
}
