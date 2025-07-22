const LoadingSpinner = ({ size = "md" }) => {
    const sizeClass = `loading-${size}`;

    return <span className={`loading loading-spinner ${sizeClass}`} />;
};
export default LoadingSpinner;

import { motion } from "framer-motion";
import XSvg from "../svgs/X";

export const ZoomLoader = () => {
    return (
        <div className="flex items-center justify-center w-full h-full">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut"
                }}
                className=" text-primary"
            >
                <XSvg className="h-30 w-30  fill-white" />
            </motion.div>
        </div>
    );
};

