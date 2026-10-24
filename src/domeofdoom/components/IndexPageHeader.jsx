// Shared Catalog/Press/Shows header. Keep typography, dividers and spacing in one place.
export default function IndexPageHeader({ heading, count, total, noun = "items", description, descriptionRef, asset, children }) {
  return <header className="border-b border-dod-lilac/50 gap-4 lg:gap-0 grid grid-cols-1 md:grid-cols-2">
    <div className="flex flex-col gap-4 lg:border-r lg:border-dod-lilac/50 lg:p-16 lg:pl-0">
      <h1 className="m-0 text-[clamp(4.5rem,6.3vw,6rem)] text-dod-neon-mint italic font-semibold">{heading}</h1>
      <div className="text-xl"><span className="text-dod-lilac font-bold">{count}</span> of {total} {noun}</div>
      <div ref={descriptionRef} className="text-xl text-dod-lilac">{description}</div>
      {children}
    </div>
    <div className="relative overflow-hidden min-h-[110px]">{asset}</div>
  </header>;
}
