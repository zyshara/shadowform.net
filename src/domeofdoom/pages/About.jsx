import { usePageTitle } from "@/hooks/usePageTitle";
import Button from "@/components/Button";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import { FLOWER_FILIGREE_PURPLE } from "@/tokens";

export default function About() {
  usePageTitle("About");
  return (
    <div className="my-10 grid grid-cols-1 items-center gap-8 border border-dod-lilac/50 font-ppneue xl:grid-cols-2">
      <div className="p-8 lg:p-16">
        <img
          className="h-auto w-full object-contain"
          src="https://assets.bigcartel.com/theme_images/142772454/DomeOfDoom_Anniversary_Small+4+web.png?auto=format&fit=max&w=1800"
          alt="Dome of Doom anniversary artwork"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-6 p-8 lg:p-16 xl:pl-0">
        <h1 className="flex flex-wrap items-center gap-4 text-[clamp(3rem,6.5vw,6rem)] font-semibold text-dod-neon-mint">
          <img className="h-12 w-12 lg:h-15 lg:w-15" src={FLOWER_FILIGREE_PURPLE} alt="" aria-hidden="true" />
          ABOUT
        </h1>
        {/* Add About copy here when ready. This page intentionally has no CMS data dependency. */}
        <div className="flex flex-col gap-6 sm:flex-row">
          <Button variant="primary" to="/press">
            <span className="flex items-center justify-center gap-2">Press<ArrowRightIcon size={15} /></span>
          </Button>
          <Button variant="secondary" to="/contact">
            <span className="flex items-center justify-center gap-2">Contact<ArrowRightIcon size={15} /></span>
          </Button>
        </div>
      </div>
    </div>
  );
}
