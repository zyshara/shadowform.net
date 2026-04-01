import grid_view_icon from "@shared/assets/icons/grid_view_icon.png";

export default function HeaderFilter({ table }) {
  return (
    <div className="p-[10px] flex flex-col items-center text-[10px] font-alagard">
      <div className="w-full pt-[5px] grid justify-between items-center grid-rows-1 grid-cols-[5fr_1fr_auto] gap-[5px]">
        <input
          className="h-[20px] w-[1fr] border px-2 py-1"
          placeholder="Search..."
        />
        <select className="h-[20px] border px-2 py-1">
          <option value="">Sort</option>
          <option value="">Name (A–Z)</option>
          <option value="">Name (Z–A)</option>
          <option value="">Recently Added</option>
        </select>
        <img className="h-[30px]" src={grid_view_icon} />
      </div>

      <div className="w-full pt-[5px] grid justify-between items-center grid-rows-1 grid-cols-3 gap-[5px]">
        <select
          className="h-[20px] border px-2 py-1"
          onChange={(e) =>
            table
              .getColumn("brand")
              ?.setFilterValue(e.target.value || undefined)
          }
        >
          <option value="">Brand</option>
          <option value="Mooncat">Mooncat</option>
        </select>
        <select className="h-[20px] border px-2 py-1">
          <option value="">Color</option>
          <option value="Red">Red</option>
        </select>
        <select className="h-[20px] border px-2 py-1">
          <option value="">Finish</option>
        </select>
      </div>
    </div>
  );
}
