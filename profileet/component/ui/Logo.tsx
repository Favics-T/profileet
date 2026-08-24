import {Scissors, X } from 'lucide-react'
import { useState } from 'react';

export default function Logo(){
     const [sidebarOpen, setSidebarOpen] = useState(false)
    return(
          <div className="p-6 shadow flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#FF6500]" />
            <span className="font-bold text-lg tracking-wide text-[#422a15]">StyledKraft</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
    )
}