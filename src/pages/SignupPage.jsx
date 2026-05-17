import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import PageHeader from "../components/layout/PageHeader";

export default function SignupPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (code !== "123456") {
      setError("인증번호가 틀립니다. 다시 입력해주세요");
      return;
    }

    navigate("/signup/profile");
  };

  return (
    <div className="min-h-screen px-8">
      <PageHeader eyebrow="Create account" title="77ㅣ록" />

      <div className="mt-32 space-y-4">
        <Input placeholder="Email" />

        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Input placeholder="인증번호" />
          <button
            type="button"
            className="h-12 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-500"
          >
            인증
          </button>
        </div>

        <Input
          placeholder="인증번호 확인"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          error={error}
        />
      </div>

      <div className="absolute left-8 right-8 bottom-20">
        <Button onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}