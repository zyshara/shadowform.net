import React, { useLayoutEffect } from "react";
import { motion } from "framer-motion";

const PageTransition = ({ children, scrollRef }) => {
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [scrollRef]);

  return (
    <motion.div
      className={`w-full h-full flex justify-center`}
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
