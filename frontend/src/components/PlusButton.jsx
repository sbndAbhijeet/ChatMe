import React from "react";
import { Link } from "react-router-dom";

const PlusButton = () => {
  return (
    <Link
      to="/create-blog" // Change this to your actual route
      className="group block rounded-xl border border-[#90AB8B]/30 bg-[#EBF4DD] shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#5A7863] hover:scale-[1.02]"
    >
      <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
        {/* Outer rectangle with plus icon */}
        <div className="relative">
          {/* Background rectangle */}
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[#90AB8B]/10 to-[#5A7863]/10 border-2 border-[#90AB8B]/30 group-hover:border-[#5A7863] transition-colors duration-300 flex items-center justify-center ">

            
            {/* Plus icon */}
            <div className="relative">
              {/* Horizontal line */}
              <div className="w-12 h-2 rounded-full bg-gradient-to-r from-[#5A7863] to-[#3B4953] group-hover:from-[#3B4953] group-hover:to-[#5A7863] transition-all duration-300"></div>
              
              {/* Vertical line */}

              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-12 rounded-full bg-gradient-to-b from-[#5A7863] to-[#3B4953] group-hover:from-[#3B4953] group-hover:to-[#5A7863] transition-all duration-300 "></div>
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#90AB8B]/0 to-[#5A7863]/0 group-hover:from-[#90AB8B]/10 group-hover:to-[#5A7863]/10 rounded-full blur-sm transition-all duration-300"></div>
            </div>
          </div>
          
          {/* Animated ring effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#5A7863]/20 transition-all duration-500"></div>
        </div>
        
        {/* Text */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-[#3B4953] group-hover:text-[#2A3639] transition-colors">
            Create New Blog
          </h3>
          <p className="text-sm text-[#5A7863] mt-2 group-hover:text-[#4A6753] transition-colors">
            Start a new learning journey
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PlusButton;