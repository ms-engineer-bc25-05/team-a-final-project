import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <AuthLayout title="ログイン">
      <AuthForm type="login" />
    </AuthLayout>
  );
}
