"use client";

import Data from "@/Shared/Data";
import Link from "next/link";

export default function Category() {
  return (
    <div className="mt-10 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto">
      <h2 className="font-bold text-3xl text-center mb-2 text-gray-900 dark:text-slate-900">
        Popular Types
      </h2>
      <p className="text-center text-gray-400 text-sm mb-10">
        What are you looking for today?
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-4">
        {Data.Category.map((category) => (
          <Link
            key={category.id}
            href={"/search/" + category.name.toLowerCase()}
            className="group flex flex-col items-center gap-2 p-4 rounded-2xl
              bg-white dark:bg-[#524fab]
              border border-gray-100 dark:border-[#17074c]
              hover:border-[#7b2ff2] dark:hover:border-[#7b2ff2]
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-200 cursor-pointer"
          >
            <img
              src={category.icon}
              width={36}
              height={36}
              alt={category.name}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span className="text-xs font-medium text-center text-gray-600 dark:text-gray-300 group-hover:text-[#7b2ff2] dark:group-hover:text-[#00C8FF] transition-colors duration-200 leading-tight">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}