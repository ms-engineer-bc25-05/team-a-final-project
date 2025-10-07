import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <AuthLayout title="新規登録">
      <AuthForm type="register" />
    </AuthLayout>
  );
}
