"use client";

import React from "react";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
  }
  
  /**
   * NOTE:
   * ログイン／登録フォームで共通利用する入力欄コンポーネント。
   * 将来的にバリデーションやエラーメッセージ追加を想定。
   */
  const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
    ({ label, type, placeholder, error, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">{label}</label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          {...props}
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl
                   text-[#2C4D63] placeholder:text-gray-400
                   focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
        {/* エラーメッセージ（赤文字） */}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
); 

AuthInput.displayName = "AuthInput";
export default AuthInput;