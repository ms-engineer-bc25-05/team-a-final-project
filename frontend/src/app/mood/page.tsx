// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import AuthLayout from "@/components/auth/AuthLayout";
// import { Laugh, Smile, Frown } from "lucide-react";
// import { motion } from "framer-motion";
// import { auth } from "@/lib/firebase";

// export default function MoodPage() {
//   const router = useRouter();
//   const [selectedMood, setSelectedMood] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const moods = [
//     { icon: <Laugh className="w-14 h-14" />, value: "high" },
//     { icon: <Smile className="w-14 h-14" />, value: "normal" },
//     { icon: <Frown className="w-14 h-14" />, value: "low" },
//   ];

//   const handleSelect = (value: string) => setSelectedMood(value);

//   const handleSubmit = async () => {
//     if (!selectedMood) return alert("気分を選択してください！");

//     const user = auth.currentUser;
//     if (!user) {
//       alert("ログインしてください！");
//       router.push("/login");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user.uid, mood: selectedMood }),
//       });
//       if (!res.ok) throw new Error("送信に失敗しました");
//       router.push("/suggestions");
//     } catch {
//       alert("もう一度お試しください。");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthLayout title="今の気分を選んでください" showCard={false}>
//       <div className="min-h-screen px-6 pt-8 pb-4 overflow-y-auto">
//         {/* サブタイトル */}
//         <p className="text-sm sm:text-base text-[#527288] leading-relaxed text-center mt-2 mb-8">
//         あなたに合った “ちょうどいい行動” を提案します。
//       </p>

//         {/* アイコン群 */}
//         <div className="flex justify-center gap-6 mb-24">
//           {moods.map((mood) => (
//             <motion.button
//               key={mood.value}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => handleSelect(mood.value)}
//               className={`flex items-center justify-center rounded-full w-24 h-24 border transition-all duration-200 ${
//                 selectedMood === mood.value
//                   ? mood.value === "high"
//                     ? "bg-[#FFF6D9] border-[#FFD166] text-[#D98A00] scale-105"
//                     : mood.value === "normal"
//                     ? "bg-[#E8F7FA] border-[#A8D2E8] text-[#2C4D63] scale-105"
//                     : "bg-[#FFE8E8] border-[#FFB6B6] text-[#B65C5C] scale-105"
//                   : "bg-white text-[#4A6A7A] border-[#D7E6EC] hover:text-[#2C4D63] hover:bg-[#F5FBFD]"
//               }`}
//             >
//               {mood.icon}
//             </motion.button>
//           ))}
//         </div>
  
//         {/* 次へボタン */}
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.96 }}
//           onClick={handleSubmit}
//           disabled={loading}
//           className={`w-full max-w-[320px] rounded-2xl py-3 font-semibold shadow-sm transition mb-10 mt-[100px] ${
//             loading
//               ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//               : "bg-linear-to-r from-[#9EC9D4] to-[#A8D8E6] text-[#2C4D63] hover:brightness-105"
//           }`}
//         >
//           {loading ? "送信中..." : "次へ"}
//         </motion.button>
//       </div>
//     </AuthLayout>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { Laugh, Smile, Frown } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";

export default function MoodPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const moods = [
    { icon: <Laugh className="w-14 h-14" />, value: "high" },
    { icon: <Smile className="w-14 h-14" />, value: "normal" },
    { icon: <Frown className="w-14 h-14" />, value: "low" },
  ];

  const handleSelect = (value: string) => setSelectedMood(value);

  const handleSubmit = async () => {
    if (!selectedMood) return alert("気分を選択してください！");

    const user = auth.currentUser;
    if (!user) {
      alert("ログインしてください！");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, mood: selectedMood }),
      });
      if (!res.ok) throw new Error("送信に失敗しました");
      router.push("/suggestions");
    } catch {
      alert("もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="今の気分を選んでください" showCard={false}>
      <div className="min-h-screen px-6 pt-8 pb-4 overflow-y-auto">
        {/* サブタイトル（アンケートと揃える） */}
        <p className="text-sm sm:text-base text-[#527288] leading-relaxed text-center mt-2 mb-8">
          あなたに合った “ちょうどいい行動” を提案します。
        </p>

        {/* アイコン群 */}
        <div className="flex justify-center gap-6 mb-20 mt-4">
          {moods.map((mood) => (
            <motion.button
              key={mood.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelect(mood.value)}
              className={`flex items-center justify-center rounded-full w-24 h-24 border transition-all duration-200 ${
                selectedMood === mood.value
                  ? mood.value === "high"
                    ? "bg-[#FFEFF4] border-[#F9C6D3] text-[#B65C7C] scale-105"
                    : mood.value === "normal"
                    ? "bg-[#FFF6D9] border-[#FFD166] text-[#D98A00] scale-105" 
                    : "bg-[#E5FAEE] border-[#A7E0B8] text-[#2F7A4B] scale-105"
                  : "bg-white text-[#4A6A7A] border-[#D7E6EC] hover:text-[#2C4D63] hover:bg-[#F5FBFD]"
              }`}
            >
              {mood.icon}
            </motion.button>
          ))}
        </div>

        {/* 次へボタン */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full max-w-[320px] rounded-2xl py-3 font-semibold shadow-sm transition mt-16 mb-10 ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-linear-to-r from-[#9EC9D4] to-[#A8D8E6] text-[#2C4D63] hover:brightness-105"
          }`}
        >
          {loading ? "送信中..." : "次へ"}
        </motion.button>
      </div>
    </AuthLayout>
  );
}
