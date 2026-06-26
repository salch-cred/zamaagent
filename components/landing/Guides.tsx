'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

const books = [
  { id: 1, chapter: 'Chapter 1', title: 'How To Start', roman: 'Chapter I', color: 'bg-[#EDECE9] text-zinc-950 border-zinc-300' },
  { id: 2, chapter: 'Chapter 2', title: 'How To Build', roman: 'Chapter II', color: 'bg-[#2E2E30] text-zinc-100 border-zinc-800' },
  { id: 3, chapter: 'Chapter 3', title: 'How To Sell', roman: 'Chapter III', color: 'bg-[#EDECE9] text-zinc-950 border-zinc-300' },
  { id: 4, chapter: 'Chapter 4', title: 'How To Scale', roman: 'Chapter IV', color: 'bg-[#2E2E30] text-zinc-100 border-zinc-800' }
]

export function Guides() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="guides-section" className="py-20 md:py-28 bg-[#E7E7E3] border-t border-zinc-300">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="w-full text-center mb-16">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500">Guides</span>
          <h2 className="text-[28px] md:text-[38px] font-normal leading-[115%] text-zinc-900 mt-2 max-w-2xl mx-auto">
            Learn how to start a company with the help of specialized agents
          </h2>
          <p className="text-zinc-600 text-sm md:text-base mt-4 max-w-xl mx-auto">
            Read the full chapters to see how Cofounder supports you from first line of code to scaling operations.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {books.map((book, index) => {
            const isHovered = hoveredIndex === index
            
            return (
              <div 
                key={book.id}
                className="book-container flex flex-col items-center cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* 3D Book Layout */}
                <motion.div
                  className={`book-card relative w-[140px] md:w-[180px] aspect-[3/4.2] rounded-r-lg border shadow-xl flex flex-col justify-between p-4 md:p-6 ${book.color}`}
                  animate={{
                    rotateY: isHovered ? -25 : 0,
                    z: isHovered ? 40 : 0,
                    boxShadow: isHovered 
                      ? '20px 20px 30px rgba(0,0,0,0.15), 5px 5px 15px rgba(0,0,0,0.1)'
                      : '5px 5px 15px rgba(0,0,0,0.08)'
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  style={{
                    transformOrigin: 'left center',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* Book spine line */}
                  <div className="absolute top-0 bottom-0 left-[3px] w-[2px] bg-black/10" />
                  
                  <div className="flex flex-col gap-1 border-b border-black/5 pb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">{book.chapter}</span>
                    <h3 className="text-base md:text-lg font-bold font-mono tracking-tight leading-tight">{book.title}</h3>
                  </div>

                  <div className="text-center font-serif italic text-2xl md:text-3xl opacity-30 my-4">
                    {book.roman}
                  </div>

                  <div className="flex justify-between items-end border-t border-black/5 pt-2 text-[8px] md:text-[9px] font-mono opacity-60">
                    <span>BY COFOUNDER</span>
                    <span>2026</span>
                  </div>
                </motion.div>

                <span className="text-xs font-mono font-medium text-zinc-500 mt-6 hover:text-zinc-900 transition-colors">
                  Read {book.roman} →
                </span>
              </div>
            )
          })}
        </div>

        <div className="w-full flex justify-center mt-12">
          <button className="cta-btn h-[44px] px-6 rounded-lg text-sm font-semibold">
            Download full guide (PDF)
          </button>
        </div>

      </div>
    </section>
  )
}
