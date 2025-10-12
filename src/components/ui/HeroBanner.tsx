// 'use client';

// import Image from 'next/image';
// import { Button } from './Button';

// interface HeroBannerProps {
//   title: string;
//   subtitle: string;
//   buttonText: string;
//   onButtonClick?: () => void;
//   backgroundImage?: string;
// }

// export function HeroBanner({
//   title,
//   subtitle,
//   buttonText,
//   onButtonClick,
//   backgroundImage
// }: HeroBannerProps) {
//   return (
//     <div className="relative w-full min-h-[500px] overflow-hidden rounded-2xl">
//       {/* Background với gradient */}
//       <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700">
//         {backgroundImage && (
//           <Image
//             src={backgroundImage}
//             alt="Hero background"
//             fill
//             className="object-cover mix-blend-overlay opacity-20"
//           />
//         )}
//       </div>
      
//       {/* Nội dung chính */}
//       <div className="relative z-10 h-full flex items-center">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//             {/* Text content */}
//             <div className="text-white space-y-6">
//               <h1 className="text-4xl md:text-6xl font-bold">
//                 {title}
//               </h1>
//               <p className="text-xl text-emerald-100">
//                 {subtitle}
//               </p>
//               <Button
//                 onClick={onButtonClick}
//                 className="bg-lime-400 text-emerald-900 hover:bg-lime-300 px-8 py-4 rounded-full"
//               >
//                 {buttonText}
//               </Button>
//             </div>
            
//             {/* Illustration */}
//             <div className="flex justify-center">
//               <div className="w-80 h-80 relative">
//                 {/* Shopping bag icon hoặc hình ảnh */}
//                 <div className="w-full h-full bg-lime-400 rounded-3xl flex items-center justify-center text-8xl">
//                   🛒
//                 </div>
//                 {/* Floating elements */}
//                 <div className="absolute top-8 right-8 w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center animate-bounce">
//                   🥕
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }