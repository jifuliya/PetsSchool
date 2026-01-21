
import React, { useMemo } from 'react';
import { Student, PetData } from '../types';

interface Props {
  students: Student[];
  pets: Record<string, PetData>;
  className: string;
  onSelectStudent: (id: string) => void;
}

const ClassroomView: React.FC<Props> = ({ students, pets, className, onSelectStudent }) => {
  
  // Sort students: High rank first.
  // Rank logic: Points + Pet Level (Stage + 1) + Food Count
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const petA = pets[a.id];
      const petB = pets[b.id];
      
      const scoreA = petA ? (petA.points + (petA.stage + 1) + petA.food) : -1;
      const scoreB = petB ? (petB.points + (petB.stage + 1) + petB.food) : -1;
      
      return scoreB - scoreA;
    });
  }, [students, pets]);

  const getRankBadge = (index: number, hasPet: boolean) => {
    if (!hasPet) return null;
    // Position adjusted: Moved up by ~1/3 from previous 105px to 140px
    if (index === 0) return <div className="absolute bottom-[140px] -right-2 text-7xl z-40 drop-shadow-xl animate-[bounce_2s_infinite] rotate-12">👑</div>;
    if (index === 1) return <div className="absolute bottom-[140px] -right-1 text-5xl z-40 drop-shadow-lg rotate-12">🥈</div>;
    if (index === 2) return <div className="absolute bottom-[140px] -right-1 text-5xl z-40 drop-shadow-lg rotate-12">🥉</div>;
    return null;
  };

  return (
    <div>
      <div className="mb-10 text-center space-y-4">
        <h2 className="text-5xl md:text-7xl font-black text-indigo-900 title-font flex items-center justify-center gap-6 pet-bounce">
          <span className="drop-shadow-lg">✨</span> {className} <span className="drop-shadow-lg">✨</span>
        </h2>
        <p className="text-indigo-400 font-black text-xl bg-white/50 inline-block px-8 py-2 rounded-full backdrop-blur-sm border-2 border-white shadow-sm">
          🌈 每一个可爱的你，都有一个属于自己的奇迹 ~ 
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 px-2">
        {sortedStudents.map((student, index) => {
          const pet = pets[student.id];
          return (
            <button
              key={student.id}
              onClick={() => onSelectStudent(student.id)}
              className="group flex flex-col items-stretch outline-none text-left"
            >
               {/* 
                  Wrapper for tight fit content:
                  w-min ensures the container shrinks to fit the width of the flex row (images),
                  so the footer (w-full) aligns perfectly with the left edge of student and right edge of pet.
               */}
               <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 rounded-[2rem] border-[4px] border-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all active:scale-95 duration-300 w-min">
                  
                  {/* Images Row */}
                  <div className="relative flex items-end">
                      {getRankBadge(index, !!pet)}
                      
                      {/* Student Image: Adaptive width */}
                      <img 
                        src={student.avatar} 
                        alt={student.name} 
                        className="h-[200px] w-auto min-w-[100px] max-w-[150px] object-cover rounded-[1.5rem] border-4 border-white shadow-md bg-white relative z-10 group-hover:rotate-1 transition-transform"
                      />
                      
                      {/* Pet Image - overlapping to the right with negative margin */}
                      <div className="w-[100px] h-[100px] flex-shrink-0 -ml-8 mb-2 z-20 relative">
                         {/* Reduced border width from 4px to 1.5px (approx 2/3 reduction) */}
                         <div className="w-full h-full rounded-[1.2rem] bg-white border-[1.5px] border-white overflow-hidden shadow-lg p-1 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                            {pet ? (
                                <img 
                                    src={pet.customImages[pet.stage]} 
                                    alt="pet" 
                                    className="w-full h-full object-cover rounded-[0.8rem]"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl opacity-40 bg-indigo-50 rounded-[0.8rem]">🐣</div>
                            )}
                         </div>
                      </div>
                  </div>

                  {/* Info Box - Width matches the container above */}
                  <div className="w-full mt-3 relative z-30 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-2xl border-2 border-white shadow-sm">
                        {/* Name */}
                        <h3 className="font-black text-xl text-indigo-900 mb-2 drop-shadow-sm truncate text-center">{student.name}</h3>
                        
                        {/* Progress Bar / Status */}
                        {pet ? (
                        <div className="w-full space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <span className="text-[10px] font-black bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full shadow-sm">LV.{pet.stage + 1}</span>
                                <span className="text-[10px] font-black text-indigo-400 truncate max-w-[60%]">"{pet.name}"</span>
                            </div>
                            <div className="w-full bg-indigo-100/50 h-2.5 rounded-full overflow-hidden border border-white shadow-inner">
                                <div 
                                    className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 h-full transition-all duration-1000 relative" 
                                    style={{ width: `${pet.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        ) : (
                        <div className="text-center py-2">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">等待领养</span>
                        </div>
                        )}
                  </div>
               </div>
            </button>
          );
        })}
        
        {students.length === 0 && (
          <div className="py-32 text-center w-full">
             <div className="text-8xl mb-8 pet-bounce inline-block">🐾</div>
             <p className="text-indigo-300 font-black text-2xl italic">乐园还没有小主人们，快去邀请伙伴吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomView;
