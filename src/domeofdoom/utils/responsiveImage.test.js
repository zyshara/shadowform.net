import { expect, it } from "vitest";
import { responsiveImage } from "./responsiveImage";

it("replaces an existing Cloudinary width without retaining a smaller cap", () => {
  const src = "https://res.cloudinary.com/example/image/upload/f_webp,q_auto,c_limit,w_400/v123/folder/cover.webp";
  const props = responsiveImage(src, "50vw", [200, 800]);
  expect(props.src).toBe(src);
  expect(props.sizes).toBe("50vw");
  expect(props.srcSet).toBe([
    src.replace("w_400", "w_200") + " 200w",
    src.replace("w_400", "w_800") + " 800w",
  ].join(", "));
});

it("adds optimized variants to original Cloudinary URLs and preserves asset paths and queries", () => {
  const props = responsiveImage("https://res.cloudinary.com/example/image/upload/v123/w_400/cover.png?version=1", "100vw", [320]);
  expect(props.srcSet).toBe("https://res.cloudinary.com/example/image/upload/f_webp,q_auto,c_limit,w_320/v123/w_400/cover.png?version=1 320w");
});

it("leaves external, local, and absent image URLs unchanged", () => {
  for (const src of ["https://f4.bcbits.com/img/a123_5.jpg", "/assets/image.webp", undefined]) {
    expect(responsiveImage(src, "50vw")).toEqual({ src });
  }
});
