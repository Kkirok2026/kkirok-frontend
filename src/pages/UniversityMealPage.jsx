import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import Modal from "../components/common/Modal";

export default function UniversityMealPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen px-7">
      <PageHeader eyebrow="University Meal" title="77ㅣ록" />

      <div className="grid grid-cols-2 bg-neutral-50 rounded-full p-2 mb-5">
        <button className="h-10 rounded-full bg-neutral-800 text-white text-sm">
          점심
        </button>
        <button className="h-10 rounded-full text-neutral-400 text-sm">
          저녁
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 bg-neutral-100 rounded-lg p-1 mb-4">
        {["한상담", "one plate", "noodle", "간편식"].map((tab, index) => (
          <button
            key={tab}
            className={[
              "h-8 rounded-md text-[10px]",
              index === 0 ? "bg-neutral-700 text-white" : "text-neutral-500",
            ].join(" ")}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-orange-300 p-5 mb-8 shadow-sm">
        <p className="text-2xl font-extrabold text-lime-600 mb-2">
          860 kcal
        </p>

        <div className="text-xs text-neutral-400 mb-3">
          <p>탄수화물 : 80g</p>
          <p>단백질 : 80g</p>
          <p>지방 : 80g</p>
        </div>

        <div className="text-sm leading-6">
          <p>새우튀김 오므라이스</p>
          <p>미니떡볶이</p>
          <p>단무지</p>
          <p>맛김치</p>
        </div>
      </div>

      <p className="text-center text-2xl font-extrabold mb-8">
        VS
      </p>

      <div className="rounded-2xl border border-neutral-200 p-5 mb-6">
        <p className="text-2xl font-extrabold text-lime-600 mb-2">
          860 kcal
        </p>

        <div className="text-sm leading-6">
          <p>새우튀김 오므라이스</p>
          <p>미니떡볶이</p>
          <p>단무지</p>
          <p>맛김치</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="ml-auto flex items-center gap-3 px-5 h-9 rounded-full bg-neutral-800 text-white text-xs"
      >
        이걸로 먹을래요
        <span>＋</span>
      </button>

      <Modal
        open={open}
        title="식단에 추가하시겠습니까?"
        confirmText="추가"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}