// src/main/components/Ornament.jsx
// The ✦·✦·✦ decorative divider used between content sections

const Ornament = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-px w-14 bg-gradient-to-l from-[#2a2a2a] to-transparent" />
      <span className="font-alkhemikal text-[10px] text-[#333] tracking-[0.2em]">
        ✦·✦·✦
      </span>
      <div className="h-px w-14 bg-gradient-to-r from-[#2a2a2a] to-transparent" />
    </div>
  );
};

export default Ornament;
