
import React from 'react';
import { Student, PetData } from '../types';

interface Props {
  student: Student;
  pet: PetData;
}

const Poster: React.FC<Props> = ({ student, pet }) => {
  return (
    <div className="max-w-xl mx-auto poster-bg p-1 rounded-3xl shadow-2xl">
      <div className="bg-white m-4 rounded-2xl p-8 text-center border-4 border-double border-yellow-200">
        <div className="mb-4">
          <span className="bg-yellow-100 text-yellow-800 text-xs font-black px-4 py-1 rounded-full tracking-widest uppercase">
            荣誉证书 · Master Trainer
          </span>
        </div>
        
        <h2 className="text-3xl font-black text-gray-800 mb-2 title-font">超级宠物训练师</h2>
        <p className="text-gray-500 text-sm mb-8">恭喜 {student.name} 与伙伴 {pet.name} 共同成长</p>
        
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full" />
          <img 
            src={pet.customImages[9]} 
            className="w-56 h-56 mx-auto object-cover rounded-full border-8 border-yellow-400 shadow-xl relative z-10" 
            alt="Final Stage Pet"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="text-left">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">领养日期</span>
            <span className="font-bold text-gray-700">{pet.adoptionDate}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">最终等级</span>
            <span className="font-bold text-gray-700">Level 10 (MAX)</span>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <p className="text-sm italic text-gray-400">“陪伴，是最好的成长礼物。”</p>
        </div>

        <div className="mt-8">
            <button 
                onClick={() => window.print()} 
                className="text-xs bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition no-print"
            >
                打印荣誉海报
            </button>
        </div>
      </div>
    </div>
  );
};

export default Poster;
