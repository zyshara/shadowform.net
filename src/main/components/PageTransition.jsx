import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const PageTransition = ({ children }) => {
  const { pathname } = useLocation();
  const isLeftAligned = pathname === "/engineering" || pathname.startsWith("/engineering/") || pathname === "/guestbook";

  return (
    <motion.div
      className={`w-full h-full flex items-center${isLeftAligned ? " lg:justify-start lg:ml-10" : " justify-center"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
