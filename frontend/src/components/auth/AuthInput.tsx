interface AuthInputProps {
    label: string;
    type: string;
    placeholder?: string;
  }
  
  /**
   * NOTE:
   * ログイン／登録フォームで共通利用する入力欄コンポーネント。
   * 将来的にバリデーションやエラーメッセージ追加を想定。
   */
  export default function AuthInput({
    label,
    type,
    placeholder,
  }: AuthInputProps) {
    return (
      <div>
        <label className="block text-sm text-[#2c4d63] mb-1">{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-[#c8dbe4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a5cbe1]"
        />
      </div>
    );
  }
  