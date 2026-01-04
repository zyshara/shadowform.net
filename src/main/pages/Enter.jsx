import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import DotDivider from "@/components/DotDivider";

import cherry_blossom from "@shared/assets/images/cherry_blossom.png";

const Enter = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      onClick={() => navigate("/about")}
      className="flex h-dvh w-dvw items-center justify-center font-alagard text-center text-[8vw] sm:text-5xl lg:text-lg text-white flex-col bg-black select-none cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <span>SHADOWFORM DOT NET</span>
      <DotDivider />
      <img
        src={cherry_blossom}
        className="w-[25vw] sm:w-30 lg:w-10 mt-[14px] white-hard-border"
      />
      <span className="opacity-75 mt-[10vw] sm:mt-[75px] [animation:hue-rotate-text_100ms_linear_infinite] md:[animation:none] md:hover:[animation:hue-rotate-text_100ms_linear_infinite]">
        &gt; click to enter &lt;
      </span>
    </motion.div>
  );
};

export default Enter;
